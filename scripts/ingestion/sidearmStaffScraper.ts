/**
 * Sidearm Sports Staff Scraper — Step 2 of the coach contact pipeline.
 *
 * ~85% of college athletic sites use Sidearm. This script fetches published
 * /sports/football/coaches/... or /staff.aspx pages and extracts ONLY what is
 * printed (mailto / tel). It never invents @university.edu addresses.
 *
 * Legal / ops constraints (operator responsibility):
 * - Respect athletics site Terms of Service and robots.txt
 * - Rate-limit aggressively (default 2.5s between requests)
 * - Re-verify monthly — coaching turnover is high
 *
 * Usage:
 *   npx tsx scripts/ingestion/sidearmStaffScraper.ts
 *   npx tsx scripts/ingestion/sidearmStaffScraper.ts --seed data/ingestion/seeds/sidearm_program_urls.sample.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { CanonicalCoachStaffRecord } from "../../src/types";
import {
  classifyRole,
  extractEmail,
  extractPhone,
  sleep,
  slugify,
  writeJsonArtifact,
} from "./lib/io";

dotenv.config();

interface SidearmSeedProgram {
  programId: string;
  institutionName: string;
  staffUrl: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseStaffCards(html: string, programId: string, staffUrl: string): CanonicalCoachStaffRecord[] {
  const verifiedAt = new Date().toISOString();
  const coaches: CanonicalCoachStaffRecord[] = [];

  // Sidearm often emits sidearm-roster-player / staff member blocks with mailto links
  const blocks = html.split(/<div[^>]+class="[^"]*(?:sidearm-roster-player|sidearm-staff-member|staff-member)[^"]*"[^>]*>/i);
  const chunks = blocks.length > 1 ? blocks.slice(1) : [html];

  for (const chunk of chunks) {
    const email = extractEmail(chunk);
    const phone = extractPhone(chunk);
    const text = stripTags(chunk.slice(0, 4000));

    // Prefer explicit name heading patterns
    const nameMatch =
      chunk.match(/<h[1-4][^>]*>([^<]{3,80})<\/h[1-4]>/i) ||
      chunk.match(/class="[^"]*name[^"]*"[^>]*>([^<]{3,80})</i);
    const titleMatch =
      chunk.match(/class="[^"]*(?:title|position)[^"]*"[^>]*>([^<]{3,120})</i) ||
      text.match(/\b(Head Coach|Offensive Coordinator|Defensive Coordinator|Recruiting Coordinator|[A-Za-z /-]{3,40} Coach)\b/i);

    const fullName = (nameMatch?.[1] || "").replace(/\s+/g, " ").trim();
    const title = (titleMatch?.[1] || titleMatch?.[0] || "").replace(/\s+/g, " ").trim();

    if (!fullName || fullName.length < 3) continue;
    if (!/coach|coordinator|director/i.test(title || text)) continue;

    const resolvedTitle = title || "Football Staff";
    coaches.push({
      id: `staff-${slugify(programId)}-${slugify(fullName)}-${slugify(resolvedTitle)}`,
      programId,
      fullName,
      title: resolvedTitle,
      roleCategory: classifyRole(resolvedTitle),
      email,
      phone,
      staffPageUrl: staffUrl,
      source: "sidearm_scrape",
      lastVerifiedAt: verifiedAt,
      isActive: true,
    });
  }

  // Deduplicate by name+title
  const seen = new Set<string>();
  return coaches.filter((c) => {
    const key = `${c.fullName.toLowerCase()}::${c.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchStaffPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "GridironGatewayStaffIndexer/1.0 (+compliance contact via APP_URL; public athletics directory sync)",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

export async function scrapeSidearmStaff(seedPath?: string): Promise<CanonicalCoachStaffRecord[]> {
  const resolvedSeed =
    seedPath ||
    path.resolve(process.cwd(), "data/ingestion/seeds/sidearm_program_urls.sample.json");

  if (!fs.existsSync(resolvedSeed)) {
    throw new Error(`Sidearm seed file missing: ${resolvedSeed}`);
  }

  const seed = JSON.parse(fs.readFileSync(resolvedSeed, "utf8")) as {
    programs: SidearmSeedProgram[];
  };

  const delayMs = Number(process.env.SIDEARM_SCRAPE_DELAY_MS || 2500);
  const allCoaches: CanonicalCoachStaffRecord[] = [];
  const errors: string[] = [];

  for (const program of seed.programs) {
    try {
      console.log(`[Sidearm] Fetching ${program.institutionName} → ${program.staffUrl}`);
      const html = await fetchStaffPage(program.staffUrl);
      const coaches = parseStaffCards(html, program.programId, program.staffUrl);
      console.log(`[Sidearm] ${program.institutionName}: ${coaches.length} staff rows parsed`);
      allCoaches.push(...coaches);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${program.programId}: ${message}`);
      console.warn(`[Sidearm] Failed ${program.institutionName}: ${message}`);
    }
    await sleep(delayMs);
  }

  const outPath = writeJsonArtifact("sidearm_coaches.json", {
    scrapedAt: new Date().toISOString(),
    count: allCoaches.length,
    missingEmailCount: allCoaches.filter((c) => !c.email).length,
    errors,
    coaches: allCoaches,
  });

  console.log(`[Sidearm] Wrote ${allCoaches.length} coach records → ${outPath}`);
  if (errors.length) {
    console.warn(`[Sidearm] ${errors.length} program errors (see artifact).`);
  }
  return allCoaches;
}

const seedArgIndex = process.argv.indexOf("--seed");
const seedArg = seedArgIndex >= 0 ? process.argv[seedArgIndex + 1] : undefined;

const isDirectRun = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || "");
if (isDirectRun) {
  scrapeSidearmStaff(seedArg).catch((err) => {
    console.error("[Sidearm] Scrape failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}


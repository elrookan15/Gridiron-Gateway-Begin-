/**
 * Sidearm Sports directory scraper — extracts published coach contacts only.
 * Maps staff rows to CollegeProgram / program_directory ids. Never invents emails.
 */
import fs from "fs";
import path from "path";
import type { CanonicalCoachStaffRecord, DatabaseCoach } from "./types";
import { toDatabaseCoach } from "./types";
import {
  classifyRole,
  extractEmail,
  extractPhone,
  sleep,
  slugify,
  writeJsonArtifact,
} from "./ingestionUtils";

export interface SidearmSeedProgram {
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

export function parseSidearmStaffHtml(
  html: string,
  programId: string,
  staffUrl: string
): CanonicalCoachStaffRecord[] {
  const verifiedAt = new Date().toISOString();
  const coaches: CanonicalCoachStaffRecord[] = [];

  const blocks = html.split(
    /<div[^>]+class="[^"]*(?:sidearm-roster-player|sidearm-staff-member|staff-member)[^"]*"[^>]*>/i
  );
  const chunks = blocks.length > 1 ? blocks.slice(1) : [html];

  for (const chunk of chunks) {
    const email = extractEmail(chunk);
    const phone = extractPhone(chunk);
    const text = stripTags(chunk.slice(0, 4000));

    const nameMatch =
      chunk.match(/<h[1-4][^>]*>([^<]{3,80})<\/h[1-4]>/i) ||
      chunk.match(/class="[^"]*name[^"]*"[^>]*>([^<]{3,80})</i);
    const titleMatch =
      chunk.match(/class="[^"]*(?:title|position)[^"]*"[^>]*>([^<]{3,120})</i) ||
      text.match(
        /\b(Head Coach|Offensive Coordinator|Defensive Coordinator|Recruiting Coordinator|[A-Za-z /-]{3,40} Coach)\b/i
      );

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
      twitterHandle: null,
      staffPageUrl: staffUrl,
      source: "sidearm_scrape",
      lastVerifiedAt: verifiedAt,
      isActive: true,
    });
  }

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
      "User-Agent":
        "GridironGatewayStaffIndexer/1.0 (+public athletics directory sync; respect robots.txt)",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

export interface SidearmScrapeResult {
  scrapedAt: string;
  count: number;
  missingEmailCount: number;
  coaches: CanonicalCoachStaffRecord[];
  databaseCoaches: DatabaseCoach[];
  errors: string[];
  artifactPath: string;
}

export async function runSidearmDirectoryScraper(options?: {
  seedPath?: string;
  programs?: SidearmSeedProgram[];
  delayMs?: number;
}): Promise<SidearmScrapeResult> {
  let programs = options?.programs;

  if (!programs) {
    const seedPath =
      options?.seedPath ||
      path.resolve(process.cwd(), "data/ingestion/seeds/sidearm_program_urls.sample.json");
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Sidearm seed file missing: ${seedPath}`);
    }
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
      programs: SidearmSeedProgram[];
    };
    programs = seed.programs;
  }

  const delayMs = options?.delayMs ?? Number(process.env.SIDEARM_SCRAPE_DELAY_MS || 2500);
  const allCoaches: CanonicalCoachStaffRecord[] = [];
  const errors: string[] = [];

  for (const program of programs) {
    try {
      const html = await fetchStaffPage(program.staffUrl);
      const coaches = parseSidearmStaffHtml(html, program.programId, program.staffUrl);
      allCoaches.push(...coaches);
    } catch (err) {
      errors.push(`${program.programId}: ${err instanceof Error ? err.message : String(err)}`);
    }
    await sleep(delayMs);
  }

  const scrapedAt = new Date().toISOString();
  const databaseCoaches = allCoaches.map(toDatabaseCoach);
  const artifactPath = writeJsonArtifact("sidearm_coaches.json", {
    scrapedAt,
    count: allCoaches.length,
    missingEmailCount: allCoaches.filter((c) => !c.email).length,
    errors,
    coaches: allCoaches,
    databaseCoaches,
  });

  return {
    scrapedAt,
    count: allCoaches.length,
    missingEmailCount: allCoaches.filter((c) => !c.email).length,
    coaches: allCoaches,
    databaseCoaches,
    errors,
    artifactPath,
  };
}

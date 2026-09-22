/**
 * Sidearm Sports directory scraper — extracts published coach contacts only.
 * Maps staff rows to `DatabaseCoach` (`src/types.ts`). Never invents emails/phones.
 */
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import type { DatabaseCoach } from "./types";
import { sleep, slugify, writeJsonArtifact } from "./ingestionUtils";

export interface SidearmSeedProgram {
  programId: string;
  institutionName: string;
  staffUrl: string;
}

export interface SidearmScrapeResult {
  scrapedAt: string;
  count: number;
  missingEmailCount: number;
  databaseCoaches: DatabaseCoach[];
  errors: string[];
  artifactPath: string;
}

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toCoachId(schoolId: string, fullName: string, title: string): string {
  return `staff-${slugify(schoolId)}-${slugify(fullName)}-${slugify(title)}`;
}

/** Parse Sidearm staff HTML (legacy + Presto/Nuxt table rows) into `DatabaseCoach` rows. */
export function parseSidearmDirectoryHtml(
  html: string,
  schoolId: string,
  directoryUrl: string,
  verifiedAt: string = new Date().toISOString()
): DatabaseCoach[] {
  const $ = cheerio.load(html);
  const coaches: DatabaseCoach[] = [];
  const seen = new Set<string>();

  const ROW_SELECTOR = [
    ".staff-directory-table tbody tr",
    ".sidearm-staff-member",
    "table.sidearm-staff-table tbody tr",
    ".c-coaches-page table tbody tr",
  ].join(", ");

  $(ROW_SELECTOR).each((_, element) => {
    const $row = $(element);
    const cells = $row.find("td");

    const name =
      $row.find(".staff-directory-name a, .sidearm-staff-member-name, td.name").first().text().trim() ||
      cells.eq(0).text().trim();
    const title =
      $row.find(".staff-directory-title, .sidearm-staff-member-title, td.title").first().text().trim() ||
      cells.eq(1).text().trim();

    const hasBioLink = $row.find('a[href*="/coaches/"]').length > 0;

    let emailRaw = $row.find(".staff-directory-email a").first().text().trim();
    if (!emailRaw) {
      const mailto = $row.find('a[href^="mailto:"]').first().attr("href");
      emailRaw = mailto?.replace(/^mailto:/i, "").split("?")[0]?.trim() ?? "";
    }
    if (!emailRaw && cells.length >= 4) {
      emailRaw = cells.eq(3).text().trim();
    }

    const phoneRaw =
      $row.find(".staff-directory-phone, .sidearm-staff-member-phone, td.phone").first().text().trim() ||
      (cells.length >= 3 ? cells.eq(2).text().trim() : "");

    const titleLower = title.toLowerCase();
    if (
      !name ||
      !(
        titleLower.includes("football") ||
        titleLower.includes("coach") ||
        titleLower.includes("coordinator") ||
        hasBioLink
      )
    ) {
      return;
    }

    const dedupeKey = `${name.toLowerCase()}::${title.toLowerCase()}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

    coaches.push({
      coachId: toCoachId(schoolId, name, title),
      schoolId,
      fullName: name,
      title,
      email: nullIfEmpty(emailRaw),
      officePhone: nullIfEmpty(phoneRaw),
      twitterHandle: null,
      sourceUrl: directoryUrl,
      lastVerifiedAt: verifiedAt,
    });
  });

  return coaches;
}

/**
 * Scrape a single Sidearm staff directory into `DatabaseCoach` rows.
 *
 * Note: In production, ensure compliance with the target site's robots.txt
 * and utilize rate limiting/user-agent rotation to avoid IP bans.
 */
export const scrapeSidearmDirectory = async (
  schoolId: string,
  directoryUrl: string
): Promise<DatabaseCoach[]> => {
  console.log(`[Sidearm Scraper] Targeting directory for ${schoolId} at ${directoryUrl}`);

  try {
    // Note: In production, ensure compliance with the target site's robots.txt
    // and utilize rate limiting/user-agent rotation to avoid IP bans.
    const response = await fetch(directoryUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "GridironGateway-IndexBot/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${directoryUrl}`);
    }

    const html = await response.text();
    const verifiedAt = new Date().toISOString();
    const coaches = parseSidearmDirectoryHtml(html, schoolId, directoryUrl, verifiedAt);

    console.log(`[Sidearm Scraper] Extracted ${coaches.length} staff members.`);
    return coaches;
  } catch (error) {
    console.error(`[Sidearm Scraper] Failed to scrape ${directoryUrl}:`, error);
    throw new Error("Scrape Failed");
  }
};

/**
 * Batch runner — scrapes each seed program via `scrapeSidearmDirectory` with rate limiting.
 */
export async function runSidearmDirectoryScraper(
  schoolIdOrOptions?: string | { seedPath?: string; programs?: SidearmSeedProgram[]; delayMs?: number },
  directoryUrl?: string
): Promise<SidearmScrapeResult> {
  if (typeof schoolIdOrOptions === "string" && directoryUrl) {
    const databaseCoaches = await scrapeSidearmDirectory(schoolIdOrOptions, directoryUrl);
    const scrapedAt = new Date().toISOString();
    const missingEmailCount = databaseCoaches.filter((c) => !c.email).length;
    const artifactPath = writeJsonArtifact("sidearm_coaches.json", {
      scrapedAt,
      count: databaseCoaches.length,
      missingEmailCount,
      errors: [],
      databaseCoaches,
    });
    return {
      scrapedAt,
      count: databaseCoaches.length,
      missingEmailCount,
      databaseCoaches,
      errors: [],
      artifactPath,
    };
  }

  const options = typeof schoolIdOrOptions === "object" ? schoolIdOrOptions : undefined;
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
  const databaseCoaches: DatabaseCoach[] = [];
  const errors: string[] = [];

  for (const program of programs) {
    try {
      const coaches = await scrapeSidearmDirectory(program.programId, program.staffUrl);
      databaseCoaches.push(...coaches);
    } catch (err) {
      errors.push(
        `${program.programId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    if (delayMs > 0) await sleep(delayMs);
  }

  const scrapedAt = new Date().toISOString();
  const missingEmailCount = databaseCoaches.filter((c) => !c.email).length;
  const artifactPath = writeJsonArtifact("sidearm_coaches.json", {
    scrapedAt,
    count: databaseCoaches.length,
    missingEmailCount,
    errors,
    databaseCoaches,
  });

  return {
    scrapedAt,
    count: databaseCoaches.length,
    missingEmailCount,
    databaseCoaches,
    errors,
    artifactPath,
  };
}

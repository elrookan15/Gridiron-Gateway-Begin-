/**
 * CFBD Ingestion Pipeline — FBS program synchronizer for production `schools` rows.
 * GET https://api.collegefootballdata.com/teams/fbs?year=YYYY
 * Auth: CFBD_API_KEY || COLLEGE_FOOTBALL_API_KEY.
 * Never invents coaching staff or .edu emails.
 */
import {
  mapFbsConferenceToTier,
  type CanonicalProgramRecord,
  type DatabaseSchool,
} from "./types";
import { normalizeHexColor, slugify, writeJsonArtifact } from "./ingestionUtils";

const CFBD_BASE_URL = "https://api.collegefootballdata.com";

interface CfbdFbsTeam {
  id?: number;
  school?: string;
  mascot?: string;
  abbreviation?: string;
  conference?: string;
  color?: string;
  alt_color?: string;
  location?: {
    city?: string;
    state?: string;
    capacity?: number;
  };
}

export interface CfbdSyncResult {
  status: "success";
  syncedAt: string;
  count: number;
  /** Production `schools` rows (`DatabaseSchool` / schema.production.sql). */
  data: DatabaseSchool[];
  schools: DatabaseSchool[];
  /** In-memory program directory shape used by server upsert + monthly pipeline. */
  programs: CanonicalProgramRecord[];
  artifactPath: string;
}

/** Resolve CFBD bearer from either supported env name (`CFBD_API_KEY || COLLEGE_FOOTBALL_API_KEY`). */
export function resolveCfbdApiKey(): string | undefined {
  const key =
    process.env.CFBD_API_KEY?.trim() ||
    process.env.COLLEGE_FOOTBALL_API_KEY?.trim();
  return key || undefined;
}

/** Helper to determine Power 4 vs Group of 5 for FBS conferences. */
export const mapConferenceToTier = mapFbsConferenceToTier;

function schoolIdForTeam(team: CfbdFbsTeam): string {
  if (typeof team.id === "number" && Number.isFinite(team.id)) {
    return `cfbd-${team.id}`;
  }
  const slug = slugify(team.school || "unknown");
  return `fbs-${slug || "unknown"}`;
}

function toDatabaseSchoolFromFbs(team: CfbdFbsTeam, syncedAt: string): DatabaseSchool | null {
  if (typeof team.school !== "string" || !team.school.trim()) return null;
  return {
    schoolId: schoolIdForTeam(team),
    institutionName: team.school.trim(),
    mascot: team.mascot?.trim() || null,
    abbreviation: team.abbreviation?.trim() || null,
    tier: mapFbsConferenceToTier(team.conference),
    conference: team.conference?.trim() || null,
    city: team.location?.city?.trim() || null,
    state: team.location?.state?.trim() || null,
    primaryColor: normalizeHexColor(team.color),
    secondaryColor: normalizeHexColor(team.alt_color),
    stadiumCapacity:
      typeof team.location?.capacity === "number" && Number.isFinite(team.location.capacity)
        ? team.location.capacity
        : null,
    lastSyncedAt: syncedAt,
  };
}

function toCanonicalProgramFromFbs(
  team: CfbdFbsTeam,
  school: DatabaseSchool,
  syncedAt: string
): CanonicalProgramRecord {
  return {
    id: school.schoolId,
    cfbdId: typeof team.id === "number" ? team.id : null,
    institutionName: school.institutionName,
    mascot: school.mascot,
    abbreviation: school.abbreviation,
    conference: school.conference,
    classification: "fbs",
    city: school.city,
    state: school.state,
    stadiumCapacity: school.stadiumCapacity,
    primaryColorHex: school.primaryColor,
    secondaryColorHex: school.secondaryColor,
    athleticsBaseUrl: null,
    dataSource: "cfbd",
    lastSyncedAt: syncedAt,
  };
}

/**
 * Fetch FBS teams and map to `DatabaseSchool` + `CanonicalProgramRecord`.
 * In production, upsert `data` into PostgreSQL `schools` (see schema.production.sql).
 */
export async function syncCfbdTeams(year = Number(process.env.CFBD_YEAR) || 2026): Promise<CfbdSyncResult> {
  console.log("📡 [CFBD Pipeline] Initiating NCAA Team Sync...");

  const apiKey = resolveCfbdApiKey();
  if (!apiKey) {
    throw new Error(
      "CFBD Sync Failed: set CFBD_API_KEY or COLLEGE_FOOTBALL_API_KEY (collegefootballdata.com)."
    );
  }

  const url = `${CFBD_BASE_URL}/teams/fbs?year=${encodeURIComponent(String(year))}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch (error) {
    console.error("❌ [CFBD Pipeline] Failed to sync team data:", error);
    throw new Error("CFBD Sync Failed");
  }

  if (!response.ok) {
    console.error(
      `❌ [CFBD Pipeline] Failed to sync team data: HTTP ${response.status} ${response.statusText}`
    );
    throw new Error("CFBD Sync Failed");
  }

  const fbsTeams = (await response.json()) as CfbdFbsTeam[];
  const syncedAt = new Date().toISOString();

  const schools: DatabaseSchool[] = [];
  const programs: CanonicalProgramRecord[] = [];

  for (const team of fbsTeams || []) {
    const school = toDatabaseSchoolFromFbs(team, syncedAt);
    if (!school) continue;
    schools.push(school);
    programs.push(toCanonicalProgramFromFbs(team, school, syncedAt));
  }

  const artifactPath = writeJsonArtifact("cfbd_programs.json", {
    source: `collegefootballdata.com/teams/fbs?year=${year}`,
    syncedAt,
    count: schools.length,
    schools,
    programs,
  });

  console.log(`✅ [CFBD Pipeline] Successfully processed ${schools.length} FBS programs.`);

  return {
    status: "success",
    syncedAt,
    count: schools.length,
    data: schools,
    schools,
    programs,
    artifactPath,
  };
}

/** CLI / monthly pipeline / admin route entrypoint. */
export const runCfbdIngestionPipeline = syncCfbdTeams;

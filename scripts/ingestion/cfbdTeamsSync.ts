/**
 * CFBD Teams Sync — Step 1 of the Gridiron Gateway program directory pipeline.
 *
 * Source of truth: CollegeFootballData.com GET /teams (Bearer auth).
 * Writes verified program JSON for Postgres upsert — never invents coaches/emails.
 *
 * Usage:
 *   set COLLEGE_FOOTBALL_API_KEY=...
 *   npx tsx scripts/ingestion/cfbdTeamsSync.ts
 */
import dotenv from "dotenv";
import type { CanonicalProgramRecord } from "../../src/types";
import { normalizeHexColor, writeJsonArtifact } from "./lib/io";

dotenv.config();

const CFBD_TEAMS_URL = "https://api.collegefootballdata.com/teams";

interface CfbdTeam {
  id?: number;
  school?: string;
  mascot?: string;
  abbreviation?: string;
  conference?: string;
  classification?: string;
  color?: string;
  alt_color?: string;
  location?: {
    city?: string;
    state?: string;
    capacity?: number;
  };
}

function mapClassification(
  raw: string | undefined
): CanonicalProgramRecord["classification"] {
  const value = (raw || "").toLowerCase();
  if (value === "fbs") return "fbs";
  if (value === "fcs") return "fcs";
  if (value === "ii" || value === "d2" || value === "division ii") return "ii";
  if (value === "iii" || value === "d3" || value === "division iii") return "iii";
  return "unknown";
}

export async function syncCfbdTeams(): Promise<CanonicalProgramRecord[]> {
  const apiKey = process.env.COLLEGE_FOOTBALL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "COLLEGE_FOOTBALL_API_KEY is required. Register at collegefootballdata.com and set it in .env"
    );
  }

  const response = await fetch(CFBD_TEAMS_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`CFBD /teams failed: HTTP ${response.status} ${response.statusText}`);
  }

  const teams = (await response.json()) as CfbdTeam[];
  const syncedAt = new Date().toISOString();

  const programs: CanonicalProgramRecord[] = teams
    .filter((team) => typeof team.id === "number" && typeof team.school === "string")
    .map((team) => ({
      id: `cfbd-${team.id}`,
      cfbdId: team.id as number,
      institutionName: team.school as string,
      mascot: team.mascot ?? null,
      abbreviation: team.abbreviation ?? null,
      conference: team.conference ?? null,
      classification: mapClassification(team.classification),
      city: team.location?.city ?? null,
      state: team.location?.state ?? null,
      stadiumCapacity: team.location?.capacity ?? null,
      primaryColorHex: normalizeHexColor(team.color),
      secondaryColorHex: normalizeHexColor(team.alt_color),
      athleticsBaseUrl: null,
      dataSource: "cfbd",
      lastSyncedAt: syncedAt,
    }));

  const outPath = writeJsonArtifact("cfbd_programs.json", {
    source: "collegefootballdata.com/teams",
    syncedAt,
    count: programs.length,
    programs,
  });

  console.log(`[CFBD] Synced ${programs.length} programs → ${outPath}`);
  return programs;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.includes("cfbdTeamsSync")) {
  syncCfbdTeams().catch((err) => {
    console.error("[CFBD] Sync failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

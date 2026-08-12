/**
 * CFBD Ingestion Pipeline — foundational NCAA program synchronizer.
 * GET https://api.collegefootballdata.com/teams (Bearer COLLEGE_FOOTBALL_API_KEY)
 * Never invents coaching staff or .edu emails.
 */
import type { CanonicalProgramRecord } from "./types";
import { normalizeHexColor, writeJsonArtifact } from "./ingestionUtils";

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

export interface CfbdSyncResult {
  syncedAt: string;
  count: number;
  programs: CanonicalProgramRecord[];
  artifactPath: string;
}

export async function runCfbdIngestionPipeline(): Promise<CfbdSyncResult> {
  const apiKey = process.env.COLLEGE_FOOTBALL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "COLLEGE_FOOTBALL_API_KEY is required. Register at collegefootballdata.com and set it server-side."
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
      dataSource: "cfbd" as const,
      lastSyncedAt: syncedAt,
    }));

  const artifactPath = writeJsonArtifact("cfbd_programs.json", {
    source: "collegefootballdata.com/teams",
    syncedAt,
    count: programs.length,
    programs,
  });

  return { syncedAt, count: programs.length, programs, artifactPath };
}

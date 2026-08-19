/**
 * Gridiron Gateway — CFBD → Supabase `schools` Production Seeder
 *
 * Supabase Edge Function (Deno). Fetches NCAA football programs from
 * CollegeFootballData and upserts into `public.schools` (schema.production.sql).
 *
 * Secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
 *   CFBD_API_KEY              — Bearer token from collegefootballdata.com
 *   COLLEGE_FOOTBALL_API_KEY  — optional alias for CFBD_API_KEY
 *   SEEDER_INVOKE_SECRET      — optional; if set, require header `x-seeder-secret`
 *
 * Auto-injected by Supabase runtime:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Invoke:
 *   POST /functions/v1/cfbd-schools-seeder
 *   Body (optional): { "year": 2026, "includeNonFbs": true }
 */
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const CFBD_BASE_URL = "https://api.collegefootballdata.com";
const UPSERT_CHUNK_SIZE = 150;
const POWER4_CONFERENCES = new Set(["SEC", "Big Ten", "Big 12", "ACC"]);

type DivisionTierEnum =
  | "FBS_POWER_4"
  | "FBS_GROUP_OF_5"
  | "FCS"
  | "D2"
  | "D3"
  | "NAIA"
  | "JUCO"
  | "PREP";

type CfbdClassification = "fbs" | "fcs" | "ii" | "iii" | string;

interface CfbdTeam {
  id?: number;
  school?: string;
  mascot?: string;
  abbreviation?: string;
  conference?: string;
  classification?: CfbdClassification;
  color?: string;
  alt_color?: string;
  location?: {
    city?: string;
    state?: string;
    capacity?: number;
  };
}

/** Matches `public.schools` columns in schema.production.sql */
interface SchoolRow {
  school_id: string;
  institution_name: string;
  mascot: string | null;
  abbreviation: string | null;
  tier: DivisionTierEnum;
  conference: string | null;
  city: string | null;
  state: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  stadium_capacity: number | null;
  last_synced_at: string;
}

interface SeederRequestBody {
  year?: number;
  includeNonFbs?: boolean;
}

interface DivisionSyncStats {
  source: string;
  fetched: number;
  mapped: number;
  upserted: number;
  skipped: number;
  errors: string[];
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-seeder-secret",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function resolveCfbdApiKey(): string | undefined {
  const key =
    Deno.env.get("CFBD_API_KEY")?.trim() ||
    Deno.env.get("COLLEGE_FOOTBALL_API_KEY")?.trim();
  return key || undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeHexColor(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const match = /^#([0-9a-fA-F]{6})$/.exec(withHash);
  return match ? `#${match[1].toLowerCase()}` : null;
}

function mapFbsConferenceToTier(
  conference: string | null | undefined,
): Extract<DivisionTierEnum, "FBS_POWER_4" | "FBS_GROUP_OF_5"> {
  if (conference && POWER4_CONFERENCES.has(conference)) {
    return "FBS_POWER_4";
  }
  return "FBS_GROUP_OF_5";
}

function classificationToTier(
  classification: CfbdClassification | undefined,
  conference: string | null | undefined,
): DivisionTierEnum {
  switch ((classification || "").toLowerCase()) {
    case "fbs":
      return mapFbsConferenceToTier(conference);
    case "fcs":
      return "FCS";
    case "ii":
      return "D2";
    case "iii":
      return "D3";
    default:
      return "FCS";
  }
}

function schoolIdForTeam(team: CfbdTeam): string {
  if (typeof team.id === "number" && Number.isFinite(team.id)) {
    return `cfbd-${team.id}`;
  }
  const slug = slugify(team.school || "unknown");
  return `cfbd-slug-${slug || "unknown"}`;
}

function toSchoolRow(team: CfbdTeam, syncedAt: string, forceFbs = false): SchoolRow | null {
  if (typeof team.school !== "string" || !team.school.trim()) {
    return null;
  }

  const conference = team.conference?.trim() || null;
  const classification = forceFbs ? "fbs" : team.classification;

  return {
    school_id: schoolIdForTeam(team),
    institution_name: team.school.trim(),
    mascot: team.mascot?.trim() || null,
    abbreviation: team.abbreviation?.trim() || null,
    tier: classificationToTier(classification, conference),
    conference,
    city: team.location?.city?.trim() || null,
    state: team.location?.state?.trim() || null,
    primary_color: normalizeHexColor(team.color),
    secondary_color: normalizeHexColor(team.alt_color),
    stadium_capacity:
      typeof team.location?.capacity === "number" && Number.isFinite(team.location.capacity)
        ? Math.trunc(team.location.capacity)
        : null,
    last_synced_at: syncedAt,
  };
}

async function fetchCfbdTeams(pathWithQuery: string, apiKey: string): Promise<CfbdTeam[]> {
  const url = `${CFBD_BASE_URL}${pathWithQuery}`;
  console.log(`📡 [cfbd-schools-seeder] GET ${url}`);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`CFBD network failure for ${pathWithQuery}: ${message}`);
  }

  if (!response.ok) {
    const bodyPreview = (await response.text()).slice(0, 400);
    throw new Error(
      `CFBD HTTP ${response.status} ${response.statusText} for ${pathWithQuery}: ${bodyPreview}`,
    );
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error(`CFBD returned non-array payload for ${pathWithQuery}`);
  }

  console.log(`✅ [cfbd-schools-seeder] Received ${payload.length} teams from ${pathWithQuery}`);
  return payload as CfbdTeam[];
}

async function upsertSchoolChunk(
  supabase: SupabaseClient,
  rows: SchoolRow[],
): Promise<{ upserted: number; error: string | null }> {
  if (rows.length === 0) {
    return { upserted: 0, error: null };
  }

  const { error, count } = await supabase.from("schools").upsert(rows, {
    onConflict: "school_id",
    ignoreDuplicates: false,
    count: "exact",
  });

  if (error) {
    console.error("❌ [cfbd-schools-seeder] Upsert chunk failed:", error.message);
    return { upserted: 0, error: error.message };
  }

  return { upserted: count ?? rows.length, error: null };
}

async function upsertSchools(
  supabase: SupabaseClient,
  rows: SchoolRow[],
): Promise<{ upserted: number; errors: string[] }> {
  const errors: string[] = [];
  let upserted = 0;

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK_SIZE);
    console.log(
      `💾 [cfbd-schools-seeder] Upserting chunk ${Math.floor(i / UPSERT_CHUNK_SIZE) + 1} (${chunk.length} rows)`,
    );
    const result = await upsertSchoolChunk(supabase, chunk);
    if (result.error) {
      errors.push(result.error);
    } else {
      upserted += result.upserted;
    }
  }

  return { upserted, errors };
}

function authorizeInvoker(req: Request): Response | null {
  const requiredSecret = Deno.env.get("SEEDER_INVOKE_SECRET")?.trim();
  if (!requiredSecret) {
    return null;
  }

  const provided = req.headers.get("x-seeder-secret")?.trim();
  if (provided !== requiredSecret) {
    console.warn("⚠️ [cfbd-schools-seeder] Rejected invoke — invalid or missing x-seeder-secret");
    return jsonResponse({ error: "Unauthorized seeder invoke." }, 401);
  }

  return null;
}

async function parseBody(req: Request): Promise<SeederRequestBody> {
  if (req.method === "GET") {
    return {};
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {};
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return {};
    }
    return body as SeederRequestBody;
  } catch {
    console.warn("⚠️ [cfbd-schools-seeder] Body parse failed — using defaults");
    return {};
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed. Use GET or POST." }, 405);
  }

  const authError = authorizeInvoker(req);
  if (authError) {
    return authError;
  }

  const startedAt = Date.now();
  console.log("🚀 [cfbd-schools-seeder] Starting CFBD → schools production seed");

  try {
    const cfbdApiKey = resolveCfbdApiKey();
    if (!cfbdApiKey) {
      return jsonResponse(
        {
          error:
            "Missing CFBD_API_KEY (or COLLEGE_FOOTBALL_API_KEY). Set via supabase secrets set.",
        },
        500,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        {
          error:
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (auto-injected in Edge runtime).",
        },
        500,
      );
    }

    const body = await parseBody(req);
    const year =
      typeof body.year === "number" && Number.isFinite(body.year) && body.year >= 2000
        ? Math.trunc(body.year)
        : Number(Deno.env.get("CFBD_YEAR")) || 2026;
    const includeNonFbs = body.includeNonFbs !== false;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const syncedAt = new Date().toISOString();
    const bySchoolId = new Map<string, SchoolRow>();
    const divisionStats: DivisionSyncStats[] = [];

    // --- FBS (year-scoped membership; Power 4 vs G5 from conference) ---
    {
      const fbsSource = `/teams/fbs?year=${encodeURIComponent(String(year))}`;
      const fbsTeams = await fetchCfbdTeams(fbsSource, cfbdApiKey);
      let mapped = 0;
      let skipped = 0;

      for (const team of fbsTeams) {
        const row = toSchoolRow(team, syncedAt, true);
        if (!row) {
          skipped += 1;
          continue;
        }
        bySchoolId.set(row.school_id, row);
        mapped += 1;
      }

      divisionStats.push({
        source: fbsSource,
        fetched: fbsTeams.length,
        mapped,
        upserted: 0,
        skipped,
        errors: [],
      });
    }

    // --- FCS / D-II / D-III (full directory; skip ids already captured as FBS) ---
    if (includeNonFbs) {
      const allSource = "/teams";
      const allTeams = await fetchCfbdTeams(allSource, cfbdApiKey);
      let mapped = 0;
      let skipped = 0;

      for (const team of allTeams) {
        const classification = (team.classification || "").toLowerCase();
        if (classification === "fbs") {
          skipped += 1;
          continue;
        }
        if (!["fcs", "ii", "iii"].includes(classification)) {
          skipped += 1;
          continue;
        }

        const row = toSchoolRow(team, syncedAt, false);
        if (!row) {
          skipped += 1;
          continue;
        }
        if (bySchoolId.has(row.school_id)) {
          skipped += 1;
          continue;
        }

        bySchoolId.set(row.school_id, row);
        mapped += 1;
      }

      divisionStats.push({
        source: allSource,
        fetched: allTeams.length,
        mapped,
        upserted: 0,
        skipped,
        errors: [],
      });
    }

    const rows = Array.from(bySchoolId.values());
    console.log(
      `📦 [cfbd-schools-seeder] Prepared ${rows.length} unique schools for upsert (year=${year})`,
    );

    const { upserted, errors } = await upsertSchools(supabase, rows);
    if (divisionStats[0]) {
      divisionStats[0].upserted = upserted;
      divisionStats[0].errors = errors;
    }

    const elapsedMs = Date.now() - startedAt;
    const tierCounts = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.tier] = (acc[row.tier] || 0) + 1;
      return acc;
    }, {});

    if (errors.length > 0) {
      console.error(`❌ [cfbd-schools-seeder] Completed with upsert errors in ${elapsedMs}ms`);
      return jsonResponse(
        {
          status: "partial_failure",
          year,
          syncedAt,
          elapsedMs,
          prepared: rows.length,
          upserted,
          tierCounts,
          divisionStats,
          errors,
        },
        502,
      );
    }

    console.log(
      `✅ [cfbd-schools-seeder] Seed complete — ${upserted} rows upserted in ${elapsedMs}ms`,
    );

    return jsonResponse({
      status: "success",
      year,
      syncedAt,
      elapsedMs,
      prepared: rows.length,
      upserted,
      tierCounts,
      divisionStats,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ [cfbd-schools-seeder] Fatal:", message);
    return jsonResponse({ status: "error", error: message }, 500);
  }
});

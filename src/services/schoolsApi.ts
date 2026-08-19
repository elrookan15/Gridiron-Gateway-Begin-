/**
 * Gridiron Gateway — Supabase schools + leaderboard athlete API
 * Tables: production `schools` / lean `athlete_profiles` (schema.production.sql)
 * Full dossier join: MVP `users` + `athlete_media` + `scholarship_offers` (schema.sql)
 */
import {
  type AthleteFullProfile,
  type DatabaseAthleteProfile,
  type DatabaseSchool,
  type DivisionTierEnum,
  type GradYear,
  type PipelineOffer,
  type Position,
  type RecruitingPipelineStage,
} from "../types";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";

export type { AthleteFullProfile };

/** Snake_case row shape returned by PostgREST for `public.schools`. */
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

/** Snake_case row shape for `public.athlete_profiles`. */
interface AthleteProfileRow {
  athlete_id: string;
  first_name: string;
  last_name: string;
  grad_year: number;
  primary_position: string;
  state: string | null;
  star_rating: number;
  true_speed_mph: number | null;
  cognition_score: number | null;
}

export interface LeaderboardRecruit {
  id: string;
  rank: number;
  fullName: string;
  position: Position;
  highSchool: string;
  state: string;
  gradClass: GradYear;
  height: string;
  weight: number;
  fortyTime: number;
  gpa: number;
  starRating: 3 | 4 | 5;
  compositeScore: number;
  committedTo?: string;
  commitmentStatus: "Committed" | "Uncommitted" | "Decommitted";
  crystalBall: { school: string; percentage: number; color: string }[];
  topOffers: string[];
  hudlUrl: string;
  avatarUrl: string;
  verifiedCoachViews: number;
  trueSpeedMph: number | null;
  cognitionScore: number | null;
}

export interface FetchSchoolsOptions {
  tier?: DivisionTierEnum;
  state?: string;
  search?: string;
  limit?: number;
}

export interface FetchLeaderboardOptions {
  gradClass?: GradYear;
  position?: Position | "ALL";
  state?: string;
  minStars?: number;
  search?: string;
  limit?: number;
}

const POSITIONS: readonly Position[] = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OT",
  "OG",
  "C",
  "DE",
  "DT",
  "EDGE",
  "LB",
  "CB",
  "S",
  "ATH",
  "K",
  "P",
  "LS",
] as const;

const GRAD_YEARS: readonly GradYear[] = [2025, 2026, 2027, 2028, 2029, 2030] as const;

function mapSchoolRow(row: SchoolRow): DatabaseSchool {
  return {
    schoolId: row.school_id,
    institutionName: row.institution_name,
    mascot: row.mascot,
    abbreviation: row.abbreviation,
    tier: row.tier,
    conference: row.conference,
    city: row.city,
    state: row.state,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    stadiumCapacity: row.stadium_capacity,
    lastSyncedAt: row.last_synced_at,
  };
}

function mapAthleteRow(row: AthleteProfileRow): DatabaseAthleteProfile {
  return {
    athleteId: row.athlete_id,
    firstName: row.first_name,
    lastName: row.last_name,
    gradYear: row.grad_year,
    primaryPosition: row.primary_position,
    state: row.state,
    starRating: row.star_rating,
    trueSpeedMph: row.true_speed_mph,
    cognitionScore: row.cognition_score,
  };
}

function toGradYear(year: number): GradYear | null {
  return (GRAD_YEARS as readonly number[]).includes(year) ? (year as GradYear) : null;
}

function toPosition(raw: string): Position {
  const normalized = raw.trim().toUpperCase();
  return (POSITIONS as readonly string[]).includes(normalized)
    ? (normalized as Position)
    : "ATH";
}

function toStarRating(raw: number): 3 | 4 | 5 {
  if (raw >= 5) return 5;
  if (raw >= 4) return 4;
  return 3;
}

/** Verified-metric composite from star rating + TrueSpeed + Cognition (0–1 scale). */
export function computeCompositeScore(athlete: DatabaseAthleteProfile): number {
  const starComponent = Math.min(Math.max(athlete.starRating, 0), 5) / 5;
  const speedComponent = Math.min(Math.max(athlete.trueSpeedMph ?? 0, 0), 25) / 25;
  const cognitionComponent = Math.min(Math.max(athlete.cognitionScore ?? 0, 0), 100) / 100;
  const score = starComponent * 0.5 + speedComponent * 0.3 + cognitionComponent * 0.2;
  return Number(score.toFixed(4));
}

function avatarForAthlete(athleteId: string): string {
  const seed = encodeURIComponent(athleteId);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=0f172a&textColor=34d399`;
}

function toLeaderboardRecruit(
  athlete: DatabaseAthleteProfile,
  rank: number,
  schools: DatabaseSchool[],
): LeaderboardRecruit {
  const compositeScore = computeCompositeScore(athlete);
  const fullName = `${athlete.firstName} ${athlete.lastName}`.trim();
  const state = athlete.state?.trim() || "N/A";

  // Scheme-fit offers: nearest Power-4 / G5 programs by state when available.
  const stateSchools = schools
    .filter((s) => s.state === athlete.state && (s.tier === "FBS_POWER_4" || s.tier === "FBS_GROUP_OF_5"))
    .slice(0, 5);

  const topOffers =
    stateSchools.length > 0
      ? stateSchools.map((s) => s.institutionName)
      : schools
          .filter((s) => s.tier === "FBS_POWER_4")
          .slice(0, 4)
          .map((s) => s.institutionName);

  const crystalBall =
    stateSchools.length > 0
      ? stateSchools.slice(0, 2).map((s, idx, arr) => {
          const percentage = idx === 0 ? (arr.length === 1 ? 100 : 70) : 30;
          return {
            school: s.institutionName,
            percentage,
            color: s.primaryColor || (idx === 0 ? "#10b981" : "#06b6d4"),
          };
        })
      : [];

  // Forty estimate from verified TrueSpeed when laser/GPS present; else null→placeholder 0 for UI.
  const fortyTime =
    athlete.trueSpeedMph != null && athlete.trueSpeedMph > 0
      ? Number((40 / (athlete.trueSpeedMph * 1.46667)).toFixed(2))
      : 0;

  return {
    id: athlete.athleteId,
    rank,
    fullName,
    position: toPosition(athlete.primaryPosition),
    highSchool: "Verified Prospect",
    state,
    gradClass: toGradYear(athlete.gradYear) ?? 2026,
    height: "—",
    weight: 0,
    fortyTime,
    gpa: 0,
    starRating: toStarRating(athlete.starRating),
    compositeScore,
    commitmentStatus: "Uncommitted",
    crystalBall,
    topOffers,
    hudlUrl: "#",
    avatarUrl: avatarForAthlete(athlete.athleteId),
    verifiedCoachViews: 0,
    trueSpeedMph: athlete.trueSpeedMph,
    cognitionScore: athlete.cognitionScore,
  };
}

export async function fetchSchools(options: FetchSchoolsOptions = {}): Promise<DatabaseSchool[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  const supabase = getSupabaseClient();
  let query = supabase
    .from("schools")
    .select(
      "school_id, institution_name, mascot, abbreviation, tier, conference, city, state, primary_color, secondary_color, stadium_capacity, last_synced_at",
    )
    .order("institution_name", { ascending: true });

  if (options.tier) {
    query = query.eq("tier", options.tier);
  }
  if (options.state && options.state !== "ALL") {
    query = query.eq("state", options.state);
  }
  if (options.search?.trim()) {
    const q = options.search.trim();
    query = query.or(
      `institution_name.ilike.%${q}%,abbreviation.ilike.%${q}%,conference.ilike.%${q}%`,
    );
  }
  if (typeof options.limit === "number" && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch schools: ${error.message}`);
  }

  return ((data ?? []) as SchoolRow[]).map(mapSchoolRow);
}

export async function fetchAthleteProfiles(): Promise<DatabaseAthleteProfile[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("athlete_profiles")
    .select(
      "athlete_id, first_name, last_name, grad_year, primary_position, state, star_rating, true_speed_mph, cognition_score",
    )
    .order("star_rating", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Failed to fetch athlete profiles: ${error.message}`);
  }

  return ((data ?? []) as AthleteProfileRow[]).map(mapAthleteRow);
}

/**
 * Live Top 250 board: rank `athlete_profiles` by verified composite, enrich offers
 * from CFBD-synced `schools` via state affinity (never invent coach contacts).
 */
export async function fetchLeaderboardRecruits(
  options: FetchLeaderboardOptions = {},
): Promise<LeaderboardRecruit[]> {
  const [athletes, schools] = await Promise.all([fetchAthleteProfiles(), fetchSchools({ limit: 400 })]);

  const ranked = athletes
    .map((athlete) => ({ athlete, composite: computeCompositeScore(athlete) }))
    .sort((a, b) => b.composite - a.composite)
    .slice(0, options.limit ?? 250)
    .map(({ athlete }, index) => toLeaderboardRecruit(athlete, index + 1, schools));

  return ranked.filter((rec) => {
    if (options.gradClass != null && rec.gradClass !== options.gradClass) return false;
    if (options.position && options.position !== "ALL" && rec.position !== options.position) {
      return false;
    }
    if (options.state && options.state !== "ALL" && rec.state !== options.state) return false;
    if (options.minStars && options.minStars > 0 && rec.starRating !== options.minStars) {
      return false;
    }
    if (options.search?.trim()) {
      const q = options.search.trim().toLowerCase();
      return (
        rec.fullName.toLowerCase().includes(q) ||
        rec.highSchool.toLowerCase().includes(q) ||
        rec.position.toLowerCase().includes(q) ||
        rec.state.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

/** Nested PostgREST shapes for `getAthleteProfileFull` (MVP schema.sql). */
interface NestedUserName {
  first_name: string;
  last_name: string;
}

interface NestedAthleteMediaRow {
  twitter_handle: string | null;
  instagram_handle: string | null;
  hudl_url: string | null;
  youtube_film_url: string | null;
}

interface NestedSchoolRow {
  id: string;
  name: string;
  primary_color?: string | null;
  abbreviation?: string | null;
  logo_url?: string | null;
}

interface NestedScholarshipOfferRow {
  id: string;
  is_official: boolean;
  offer_date: string;
  commitment_status: string;
  schools: NestedSchoolRow | NestedSchoolRow[] | null;
}

interface AthleteFullProfileRow {
  user_id: string;
  height_inches: number | null;
  weight_lbs: number | null;
  forty_yard_dash: number | null;
  vertical_jump_inches: number | null;
  position_tier: string | null;
  star_rating: number | null;
  users: NestedUserName | NestedUserName[] | null;
  athlete_media: NestedAthleteMediaRow | NestedAthleteMediaRow[] | null;
  scholarship_offers: NestedScholarshipOfferRow[] | null;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapOfferSchool(
  school: NestedSchoolRow | NestedSchoolRow[] | null,
): AthleteFullProfile["offers"][number]["school"] {
  const row = unwrapOne(school);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    primary_color: row.primary_color ?? null,
    abbreviation: row.abbreviation ?? null,
  };
}

function mapAthleteMedia(
  media: NestedAthleteMediaRow | NestedAthleteMediaRow[] | null,
): AthleteFullProfile["media"] {
  const row = unwrapOne(media);
  if (!row) return null;
  return {
    twitter_handle: row.twitter_handle,
    instagram_handle: row.instagram_handle,
    hudl_link: row.hudl_url,
    youtube_link: row.youtube_film_url,
  };
}

/**
 * Join athlete_profiles → users (name) → athlete_media → scholarship_offers → schools.
 * PK filter uses `user_id` per schema.sql MVP athlete_profiles.
 */
export async function getAthleteProfileFull(
  athleteId: string,
): Promise<AthleteFullProfile | null> {
  if (!athleteId.trim()) {
    console.error("getAthleteProfileFull: athleteId is required.");
    return null;
  }

  if (!isSupabaseConfigured()) {
    console.error("Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
    return null;
  }

  const supabase = getSupabaseClient();

  // Column names match schema.sql MVP:
  // - athlete_profiles.user_id (PK)
  // - athlete_media.hudl_url / youtube_film_url (mapped → hudl_link / youtube_link)
  // - schools.id / name (+ optional primary_color / abbreviation if migrated)
  const { data, error } = await supabase
    .from("athlete_profiles")
    .select(
      `
      user_id,
      height_inches,
      weight_lbs,
      forty_yard_dash,
      vertical_jump_inches,
      position_tier,
      star_rating,
      users!inner(first_name, last_name),
      athlete_media(twitter_handle, instagram_handle, hudl_url, youtube_film_url),
      scholarship_offers(
        id,
        is_official,
        offer_date,
        commitment_status,
        schools(id, name)
      )
    `,
    )
    .eq("user_id", athleteId)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching athlete ${athleteId}:`, error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as AthleteFullProfileRow;
  const user = unwrapOne(row.users);

  const offers: AthleteFullProfile["offers"] = (row.scholarship_offers ?? [])
    .map((offer) => ({
      id: offer.id,
      is_official: Boolean(offer.is_official),
      offer_date: offer.offer_date,
      commitment_status: offer.commitment_status,
      school: mapOfferSchool(offer.schools),
    }))
    .sort(
      (a, b) => new Date(b.offer_date).getTime() - new Date(a.offer_date).getTime(),
    );

  return {
    id: row.user_id,
    first_name: user?.first_name || "Unknown",
    last_name: user?.last_name || "Athlete",
    height_inches: row.height_inches,
    weight_lbs: row.weight_lbs,
    forty_yard_dash: row.forty_yard_dash,
    vertical_jump_inches: row.vertical_jump_inches,
    position_tier: row.position_tier,
    star_rating: row.star_rating,
    media: mapAthleteMedia(row.athlete_media),
    offers,
  };
}

/** Nested shapes for `getPipelineOffers` (scholarship_offers → athlete_profiles → users). */
interface PipelineAthleteEmbed {
  user_id: string;
  primary_position: string | null;
  position_tier: string | null;
  star_rating: number | null;
  users: NestedUserName | NestedUserName[] | null;
}

interface PipelineOfferRow {
  id: string;
  school_id: string;
  athlete_id: string;
  is_official: boolean;
  offer_date: string;
  commitment_status: string;
  notes: string | null;
  athlete_profiles: PipelineAthleteEmbed | PipelineAthleteEmbed[] | null;
}

const OFFICIAL_VISIT_TAG = "[pipeline:Official Visit]";

/**
 * Derive Kanban stage from offer flags until a dedicated `pipeline_stage` column ships.
 * Official Visit is tagged in `notes` so it survives reload.
 */
export function derivePipelineStage(
  commitmentStatus: string,
  isOfficial: boolean,
  notes?: string | null,
): RecruitingPipelineStage {
  const status = commitmentStatus.trim().toLowerCase();
  if (status === "committed" || status === "signed") {
    return "Committed";
  }
  if (notes?.includes(OFFICIAL_VISIT_TAG)) {
    return "Official Visit";
  }
  if (isOfficial) {
    return "Offered";
  }
  return "Evaluating";
}

/**
 * Coach workspace: offers for a single school (RLS will scope by school_id when auth is wired).
 * Joins athlete name / position / star rating in one request.
 */
export async function getPipelineOffers(schoolId: string): Promise<PipelineOffer[]> {
  if (!schoolId.trim()) {
    throw new Error("getPipelineOffers: schoolId is required.");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("scholarship_offers")
    .select(
      `
      id,
      school_id,
      athlete_id,
      is_official,
      offer_date,
      commitment_status,
      notes,
      athlete_profiles!inner(
        user_id,
        primary_position,
        position_tier,
        star_rating,
        users!inner(first_name, last_name)
      )
    `,
    )
    .eq("school_id", schoolId)
    .order("offer_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch pipeline offers: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as PipelineOfferRow[];

  return rows.map((row) => {
    const athlete = unwrapOne(row.athlete_profiles);
    const user = unwrapOne(athlete?.users ?? null);
    const first = user?.first_name?.trim() || "Unknown";
    const last = user?.last_name?.trim() || "Athlete";
    const position =
      athlete?.primary_position?.trim() ||
      athlete?.position_tier?.trim() ||
      "ATH";
    const starRating = Math.min(Math.max(athlete?.star_rating ?? 0, 0), 5);

    return {
      id: row.id,
      schoolId: row.school_id,
      athleteId: row.athlete_id,
      isOfficial: Boolean(row.is_official),
      offerDate: row.offer_date,
      commitmentStatus: row.commitment_status,
      stage: derivePipelineStage(
        row.commitment_status,
        Boolean(row.is_official),
        row.notes,
      ),
      athleteName: `${first} ${last}`.trim(),
      position,
      starRating,
    };
  });
}

/**
 * Persist a stage move. Maps Kanban columns onto `is_official` + `commitment_status`
 * (+ notes tag for Official Visit) until a dedicated pipeline_stage column exists.
 */
export async function updatePipelineOfferStage(
  offerId: string,
  stage: RecruitingPipelineStage,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = getSupabaseClient();

  // Preserve non-pipeline notes while toggling the OV tag
  const { data: existing, error: readError } = await supabase
    .from("scholarship_offers")
    .select("notes")
    .eq("id", offerId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read offer notes: ${readError.message}`);
  }

  const priorNotes = ((existing as { notes?: string | null } | null)?.notes ?? "")
    .replace(OFFICIAL_VISIT_TAG, "")
    .trim();
  const notes =
    stage === "Official Visit"
      ? `${OFFICIAL_VISIT_TAG}${priorNotes ? ` ${priorNotes}` : ""}`.trim()
      : priorNotes || null;

  const patch = {
    is_official: stage !== "Evaluating",
    commitment_status: stage === "Committed" ? "Committed" : "Uncommitted",
    notes,
  };

  const { error } = await supabase
    .from("scholarship_offers")
    .update(patch)
    .eq("id", offerId);

  if (error) {
    throw new Error(`Failed to update pipeline stage: ${error.message}`);
  }
}

export {
  fetchNilTransactionsForAthlete,
  releaseNilEscrowPayout,
} from "./nilTransactionsApi";
export { getTransferPortalAthletes } from "./transferPortalApi";

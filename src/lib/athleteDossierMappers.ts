/**
 * Production athlete_profiles → AthleteProfileModal dossier card.
 * Keep this file free of the Supabase client so mapper tests stay offline.
 */
import type { AthleteFullProfile, DatabaseAthleteProfile } from "../types";

export interface ProductionSchoolEmbed {
  school_id: string;
  institution_name: string;
  primary_color?: string | null;
  abbreviation?: string | null;
}

export interface ProductionOfferEmbed {
  id: string;
  is_official: boolean;
  offer_date: string;
  commitment_status: string;
  schools: ProductionSchoolEmbed | ProductionSchoolEmbed[] | null;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Map production `schools` embed → dossier offer school. Never invent contacts. */
export function mapProductionOfferSchool(
  school: ProductionSchoolEmbed | ProductionSchoolEmbed[] | null,
): AthleteFullProfile["offers"][number]["school"] {
  const row = unwrapOne(school);
  if (!row) return null;
  const id = row.school_id?.trim();
  const name = row.institution_name?.trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    primary_color: row.primary_color ?? null,
    abbreviation: row.abbreviation ?? null,
  };
}

export function mapProductionOfferEmbed(
  offer: ProductionOfferEmbed,
): AthleteFullProfile["offers"][number] {
  return {
    id: offer.id,
    is_official: Boolean(offer.is_official),
    offer_date: offer.offer_date,
    commitment_status: offer.commitment_status,
    school: mapProductionOfferSchool(offer.schools),
  };
}

/**
 * Leaderboard `DatabaseAthleteProfile` → dossier card.
 * Lean production table has no height/weight/laser/media columns — leave those null
 * rather than querying MVP `users` / `athlete_media` (PostgREST 400 after cutover).
 */
export function mapProductionAthleteToFullProfile(
  athlete: DatabaseAthleteProfile,
  offers: AthleteFullProfile["offers"] = [],
): AthleteFullProfile {
  return {
    id: athlete.athleteId,
    first_name: athlete.firstName,
    last_name: athlete.lastName,
    height_inches: null,
    weight_lbs: null,
    forty_yard_dash: null,
    vertical_jump_inches: null,
    position_tier: athlete.primaryPosition || null,
    star_rating: athlete.starRating,
    media: null,
    offers,
  };
}

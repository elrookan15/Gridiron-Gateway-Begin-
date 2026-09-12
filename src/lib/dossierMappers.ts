/**
 * Pure mappers for athlete dossier / offer embeds.
 * Production schools: school_id + institution_name (live Supabase / schema.production.sql).
 * UI AthleteFullProfile keeps id/name aliases for modal stability.
 */
import type { AthleteFullProfile } from "../types";

/** PostgREST nested row from `scholarship_offers → schools`. */
export interface ProductionOfferSchoolRow {
  school_id: string;
  institution_name: string;
  primary_color?: string | null;
  abbreviation?: string | null;
}

export type OfferSchoolView = AthleteFullProfile["offers"][number]["school"];

export function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Map production school embed → dossier offer school view.
 * Never invent institution names or brand colors.
 */
export function mapProductionOfferSchool(
  school: ProductionOfferSchoolRow | ProductionOfferSchoolRow[] | null,
): OfferSchoolView {
  const row = unwrapOne(school);
  if (!row) return null;
  const schoolId = row.school_id?.trim();
  const name = row.institution_name?.trim();
  if (!schoolId || !name) return null;
  return {
    id: schoolId,
    name,
    primary_color: row.primary_color ?? null,
    abbreviation: row.abbreviation ?? null,
  };
}

/**
 * Server-only COPPA facts for the messaging gate.
 * Client `athleteAge` / `hasParentalConsent` are not authority —
 * `athlete_profiles.date_of_birth` and `contact_authorized` are.
 */
import { getServiceRoleClient } from "./supabaseAdmin";

export interface AthleteComplianceRow {
  date_of_birth: string | null;
  contact_authorized: boolean | null;
}

export interface ComplianceAthleteGateFacts {
  athleteAge: number;
  hasParentalConsent: boolean;
  source: "postgres" | "fail-closed" | "dev-fallback";
}

const PK_CANDIDATES = ["athlete_id", "user_id", "id"] as const;

/** Whole years from ISO/date-only DOB. Invalid DOB → 0 (fail-closed minor). */
export function ageFromDob(dob: Date, now: Date): number {
  if (Number.isNaN(dob.getTime()) || Number.isNaN(now.getTime())) return 0;
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - dob.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age < 0 ? 0 : age;
}

/**
 * Map a profile row to gate inputs. Missing row / missing DOB → age 0.
 * Consent is only `contact_authorized === true` (parental_consents trigger).
 */
export function gateFactsFromAthleteRow(
  row: AthleteComplianceRow | null,
  now: Date = new Date(),
): Pick<ComplianceAthleteGateFacts, "athleteAge" | "hasParentalConsent"> {
  if (!row) {
    return { athleteAge: 0, hasParentalConsent: false };
  }
  const rawDob = row.date_of_birth?.trim() ?? "";
  const dob = rawDob ? new Date(rawDob) : null;
  const athleteAge = dob ? ageFromDob(dob, now) : 0;
  return {
    athleteAge,
    hasParentalConsent: row.contact_authorized === true,
  };
}

async function fetchAthleteComplianceRow(
  athleteId: string,
): Promise<AthleteComplianceRow | null> {
  const client = getServiceRoleClient();
  if (!client) return null;

  for (const pk of PK_CANDIDATES) {
    const { data, error } = await client
      .from("athlete_profiles")
      .select("date_of_birth, contact_authorized")
      .eq(pk, athleteId)
      .maybeSingle();
    if (error || !data) continue;
    const record = data as Record<string, unknown>;
    return {
      date_of_birth:
        record.date_of_birth == null ? null : String(record.date_of_birth),
      contact_authorized: record.contact_authorized === true,
    };
  }
  return null;
}

/**
 * Authoritative age + consent for HTTP dispatch.
 * Never returns client `hasParentalConsent: true` without a Postgres row.
 */
export async function resolveComplianceAthleteGate(
  athleteId: string,
  fallbackAge: number,
): Promise<ComplianceAthleteGateFacts> {
  const id = athleteId.trim();
  const client = getServiceRoleClient();
  const isProd = process.env.NODE_ENV === "production";

  if (!id) {
    return { athleteAge: 0, hasParentalConsent: false, source: "fail-closed" };
  }

  if (!client) {
    if (isProd) {
      return { athleteAge: 0, hasParentalConsent: false, source: "fail-closed" };
    }
    const age = Number.isFinite(fallbackAge) && fallbackAge >= 0 ? Math.floor(fallbackAge) : 0;
    return { athleteAge: age, hasParentalConsent: false, source: "dev-fallback" };
  }

  const row = await fetchAthleteComplianceRow(id);
  if (!row) {
    return { athleteAge: 0, hasParentalConsent: false, source: "fail-closed" };
  }
  return { ...gateFactsFromAthleteRow(row), source: "postgres" };
}

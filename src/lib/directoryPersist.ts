/**
 * Server-only Postgres writer for production `schools` + `college_coaches`.
 * Never import from the Vite SPA — service role must stay off the bundle.
 */
import type { CanonicalProgramRecord, DatabaseCoach, DatabaseSchool } from "../types";
import { toDatabaseSchool } from "../types";
import {
  getServiceRoleClient,
  isServiceRoleConfigured,
  type PersistResult,
} from "./supabaseAdmin";

export function isDirectoryPostgresConfigured(): boolean {
  return isServiceRoleConfigured();
}

export type DirectoryPersistResult = PersistResult;

function toSchoolInsert(school: DatabaseSchool): Record<string, unknown> {
  return {
    school_id: school.schoolId,
    institution_name: school.institutionName,
    mascot: school.mascot,
    abbreviation: school.abbreviation,
    tier: school.tier,
    conference: school.conference,
    city: school.city,
    state: school.state,
    primary_color: school.primaryColor,
    secondary_color: school.secondaryColor,
    stadium_capacity: school.stadiumCapacity,
    last_synced_at: school.lastSyncedAt,
  };
}

function toCoachInsert(coach: DatabaseCoach): Record<string, unknown> {
  const row: Record<string, unknown> = {
    school_id: coach.schoolId,
    full_name: coach.fullName,
    title: coach.title,
    email: coach.email,
    office_phone: coach.officePhone,
    twitter_handle: coach.twitterHandle,
    source_url: coach.sourceUrl,
    last_verified_at: coach.lastVerifiedAt,
  };
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(coach.coachId)) {
    row.coach_id = coach.coachId;
  }
  return row;
}

export async function persistProgramsToPostgres(
  programs: CanonicalProgramRecord[],
): Promise<DirectoryPersistResult> {
  const client = getServiceRoleClient();
  if (!client) {
    return {
      ok: false,
      upserted: 0,
      error: "SUPABASE_SERVICE_ROLE_KEY unset — directory RAM mirror only.",
    };
  }
  if (programs.length === 0) {
    return { ok: true, upserted: 0 };
  }

  const rows = programs.map((p) => toSchoolInsert(toDatabaseSchool(p)));
  const { error } = await client.from("schools").upsert(rows, { onConflict: "school_id" });
  if (error) {
    return { ok: false, upserted: 0, error: error.message };
  }
  return { ok: true, upserted: rows.length };
}

export async function persistCoachesToPostgres(
  coaches: DatabaseCoach[],
): Promise<DirectoryPersistResult> {
  const client = getServiceRoleClient();
  if (!client) {
    return {
      ok: false,
      upserted: 0,
      error: "SUPABASE_SERVICE_ROLE_KEY unset — coaches RAM mirror only.",
    };
  }
  if (coaches.length === 0) {
    return { ok: true, upserted: 0 };
  }

  const withId = coaches.filter((c) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(c.coachId),
  );
  const withoutId = coaches.filter(
    (c) =>
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(c.coachId),
  );

  let upserted = 0;

  if (withId.length > 0) {
    const { error } = await client
      .from("college_coaches")
      .upsert(withId.map(toCoachInsert), { onConflict: "coach_id" });
    if (error) {
      return { ok: false, upserted, error: error.message };
    }
    upserted += withId.length;
  }

  if (withoutId.length > 0) {
    const { error } = await client.from("college_coaches").insert(withoutId.map(toCoachInsert));
    if (error) {
      return { ok: false, upserted, error: error.message };
    }
    upserted += withoutId.length;
  }

  return { ok: true, upserted };
}

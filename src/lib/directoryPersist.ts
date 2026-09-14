/**
 * Server-only Postgres writer for production `schools` + `college_coaches`.
 * Never import from the Vite SPA — service role must stay off the bundle.
 */
import { createHash } from "node:crypto";
import type { CanonicalProgramRecord, DatabaseCoach, DatabaseSchool } from "../types";
import { toDatabaseSchool } from "../types";
import {
  getServiceRoleClient,
  isServiceRoleConfigured,
  type PersistResult,
} from "./supabaseAdmin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** RFC 4122 DNS namespace — Sidearm/CSV slug ids hash into this space. */
const COACH_ID_NAMESPACE_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function uuidToBytes(uuid: string): Buffer {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
}

function uuidV5(namespaceUuid: string, name: string): string {
  const hash = createHash("sha1")
    .update(uuidToBytes(namespaceUuid))
    .update(name, "utf8")
    .digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * `college_coaches.coach_id` is UUID PK. Sidearm/CSV emit stable slug ids
 * (`staff-…`, `csv-coach-…`). Hash those to UUID v5 so re-ingest upserts
 * instead of inserting a new gen_random_uuid() row every run.
 */
export function coachIdToUuid(stableId: string): string {
  const trimmed = stableId.trim();
  if (UUID_RE.test(trimmed)) return trimmed.toLowerCase();
  return uuidV5(COACH_ID_NAMESPACE_UUID, trimmed);
}

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
  return {
    coach_id: coachIdToUuid(coach.coachId),
    school_id: coach.schoolId,
    full_name: coach.fullName,
    title: coach.title,
    email: coach.email,
    office_phone: coach.officePhone,
    twitter_handle: coach.twitterHandle,
    source_url: coach.sourceUrl,
    last_verified_at: coach.lastVerifiedAt,
  };
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

  const { error } = await client
    .from("college_coaches")
    .upsert(coaches.map(toCoachInsert), { onConflict: "coach_id" });
  if (error) {
    return { ok: false, upserted: 0, error: error.message };
  }
  return { ok: true, upserted: coaches.length };
}

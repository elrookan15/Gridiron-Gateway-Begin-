/**
 * Server-only BioScan + Combine Laser Postgres writers/readers.
 */
import { getServiceRoleClient, type PersistResult } from "./supabaseAdmin";

export interface BioscanTelemetryRecord {
  session_id: string;
  athlete_external_id: string;
  timestamp: string;
  max_velocity_mph: number;
  acceleration_rate: number;
  player_load_total: number;
  heart_rate_bpm: number;
  processed_at: string;
}

export interface LaserCombineRecord {
  id: string;
  athleteName: string;
  combineEventName: string;
  laserFortyTime: number;
  laserShuttleTime: number;
  laserThreeConeTime: number;
  verticalJumpInches: number;
  broadJumpInches: number;
  badge: string;
  timestamp: string;
}

export async function persistBioscanTelemetry(
  row: BioscanTelemetryRecord,
): Promise<PersistResult> {
  const client = getServiceRoleClient();
  if (!client) {
    return { ok: false, upserted: 0, error: "SUPABASE_SERVICE_ROLE_KEY unset — BioScan RAM only." };
  }

  const { error } = await client.from("bioscan_telemetry").upsert(
    {
      athlete_external_id: row.athlete_external_id,
      session_id: row.session_id,
      timestamp: row.timestamp,
      max_velocity_mph: row.max_velocity_mph,
      acceleration_rate: row.acceleration_rate,
      player_load_total: row.player_load_total,
      heart_rate_bpm: row.heart_rate_bpm,
      processed_at: row.processed_at,
    },
    { onConflict: "athlete_external_id" },
  );

  if (error) return { ok: false, upserted: 0, error: error.message };
  return { ok: true, upserted: 1 };
}

export async function fetchBioscanTelemetry(
  athleteExternalId: string,
): Promise<BioscanTelemetryRecord | null> {
  const client = getServiceRoleClient();
  if (!client) return null;

  const { data, error } = await client
    .from("bioscan_telemetry")
    .select(
      "session_id, athlete_external_id, timestamp, max_velocity_mph, acceleration_rate, player_load_total, heart_rate_bpm, processed_at",
    )
    .eq("athlete_external_id", athleteExternalId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    session_id: String(data.session_id),
    athlete_external_id: String(data.athlete_external_id),
    timestamp: String(data.timestamp),
    max_velocity_mph: Number(data.max_velocity_mph) || 0,
    acceleration_rate: Number(data.acceleration_rate) || 0,
    player_load_total: Number(data.player_load_total) || 0,
    heart_rate_bpm: Number(data.heart_rate_bpm) || 0,
    processed_at: String(data.processed_at),
  };
}

export async function persistLaserCombineEntry(
  row: LaserCombineRecord,
): Promise<PersistResult> {
  const client = getServiceRoleClient();
  if (!client) {
    return { ok: false, upserted: 0, error: "SUPABASE_SERVICE_ROLE_KEY unset — laser RAM only." };
  }

  const { error } = await client.from("combine_laser_entries").upsert(
    {
      id: row.id,
      athlete_name: row.athleteName,
      combine_event_name: row.combineEventName,
      laser_forty_time: row.laserFortyTime,
      laser_shuttle_time: row.laserShuttleTime,
      laser_three_cone_time: row.laserThreeConeTime,
      vertical_jump_inches: row.verticalJumpInches,
      broad_jump_inches: row.broadJumpInches,
      badge: row.badge,
      recorded_at: row.timestamp,
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false, upserted: 0, error: error.message };
  return { ok: true, upserted: 1 };
}

export async function listLaserCombineEntries(limit = 100): Promise<LaserCombineRecord[]> {
  const client = getServiceRoleClient();
  if (!client) return [];

  const { data, error } = await client
    .from("combine_laser_entries")
    .select(
      "id, athlete_name, combine_event_name, laser_forty_time, laser_shuttle_time, laser_three_cone_time, vertical_jump_inches, broad_jump_inches, badge, recorded_at",
    )
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: String(row.id),
    athleteName: String(row.athlete_name),
    combineEventName: String(row.combine_event_name),
    laserFortyTime: Number(row.laser_forty_time) || 0,
    laserShuttleTime: Number(row.laser_shuttle_time) || 0,
    laserThreeConeTime: Number(row.laser_three_cone_time) || 0,
    verticalJumpInches: Number(row.vertical_jump_inches) || 0,
    broadJumpInches: Number(row.broad_jump_inches) || 0,
    badge: String(row.badge),
    timestamp: String(row.recorded_at),
  }));
}

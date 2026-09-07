import type { PortalStatus, TransferPortalAthlete, TransferType } from "../types";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";

interface TransferPortalRow {
  id: string;
  athlete_id: string;
  athlete_name: string;
  position: string;
  star_rating: number;
  transfer_type: TransferType;
  eligibility_remaining: number;
  origin_school_id: string;
  origin_school_name: string;
  origin_primary_color: string;
  destination_school_id: string | null;
  destination_school_name: string | null;
  destination_primary_color: string | null;
  entry_date: string;
  status: PortalStatus;
}

function mapTransferPortalRow(row: TransferPortalRow): TransferPortalAthlete {
  const destination =
    row.destination_school_id && row.destination_school_name
      ? {
          id: row.destination_school_id,
          name: row.destination_school_name,
          primaryColor: row.destination_primary_color ?? "#334155",
        }
      : null;

  return {
    id: row.id,
    athleteId: row.athlete_id,
    athleteName: row.athlete_name,
    position: row.position,
    starRating: row.star_rating,
    transferType: row.transfer_type,
    eligibilityRemaining: row.eligibility_remaining,
    originSchool: {
      id: row.origin_school_id,
      name: row.origin_school_name,
      primaryColor: row.origin_primary_color,
    },
    destinationSchool: destination,
    entryDate: row.entry_date,
    status: row.status,
  };
}

export async function getTransferPortalAthletes(): Promise<TransferPortalAthlete[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("transfer_portal_entries")
    .select(
      "id, athlete_id, athlete_name, position, star_rating, transfer_type, eligibility_remaining, origin_school_id, origin_school_name, origin_primary_color, destination_school_id, destination_school_name, destination_primary_color, entry_date, status",
    )
    .order("entry_date", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to fetch transfer portal: ${error.message}`);
  }

  return ((data ?? []) as TransferPortalRow[]).map(mapTransferPortalRow);
}

/** Server-authoritative portal lock for RallySafe — never trust a client flag. */
export async function isAthleteActiveInTransferPortal(athleteId: string): Promise<boolean> {
  const id = athleteId.trim();
  if (!id || !isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("transfer_portal_entries")
    .select("id")
    .eq("athlete_id", id)
    .eq("status", "ACTIVE")
    .limit(1);

  if (error) {
    throw new Error(`Failed to resolve transfer portal lock: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

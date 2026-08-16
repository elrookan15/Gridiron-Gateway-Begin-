import type { ClearinghouseStatus, NilTransaction } from "../types";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";

interface NilTransactionRow {
  id: string;
  athlete_id: string;
  sponsor_name: string;
  deal_amount_cents: number;
  clearinghouse_status: ClearinghouseStatus;
  payout_released: boolean;
  vbp_notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapNilTransaction(row: NilTransactionRow): NilTransaction {
  return {
    id: row.id,
    athleteId: row.athlete_id,
    sponsorName: row.sponsor_name,
    dealAmountCents: row.deal_amount_cents,
    clearinghouseStatus: row.clearinghouse_status,
    payoutReleased: row.payout_released,
    vbpNotes: row.vbp_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchNilTransactionsForAthlete(athleteId: string): Promise<NilTransaction[]> {
  if (!athleteId.trim()) {
    throw new Error("athleteId is required.");
  }
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("nil_transactions")
    .select(
      "id, athlete_id, sponsor_name, deal_amount_cents, clearinghouse_status, payout_released, vbp_notes, created_at, updated_at",
    )
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch NIL ledger: ${error.message}`);
  }

  return ((data ?? []) as NilTransactionRow[]).map(mapNilTransaction);
}

/**
 * Sets payout_released = true. Postgres `enforce_cleared_payout` rejects this
 * unless clearinghouse_status = CLEARED. RLS blocks non-compliance JWTs.
 * Optimistic UI is forbidden — only persist after a returned row.
 */
export async function releaseNilEscrowPayout(transactionId: string): Promise<NilTransaction> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("nil_transactions")
    .update({ payout_released: true })
    .eq("id", transactionId)
    .eq("payout_released", false)
    .select(
      "id, athlete_id, sponsor_name, deal_amount_cents, clearinghouse_status, payout_released, vbp_notes, created_at, updated_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message.includes("enforce_cleared_payout")
        ? "FAIL_CLOSED: Postgres rejected payout_released on a non-CLEARED deal."
        : `Escrow release blocked: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "FAIL_CLOSED: no row updated (not CLEARED, already released, or RLS denied).",
    );
  }

  return mapNilTransaction(data as NilTransactionRow);
}

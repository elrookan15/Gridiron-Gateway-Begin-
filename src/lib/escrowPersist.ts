/**
 * Server-only RallySafe Express campaign Postgres writers/readers.
 * Distinct from SPA `nil_transactions` athlete ledger.
 */
import type { ClearinghouseStatus, NilRegulatoryPlane } from "../types";
import { getServiceRoleClient, type PersistResult } from "./supabaseAdmin";

export interface EscrowCampaignRecord {
  campaignId: string;
  sponsorId: string;
  athleteId: string;
  amountUsdCents: number;
  amountUsdFormatted: string;
  milestoneConditions: unknown[];
  stripeClientSecret: string;
  escrowStatus: string;
  created_at: string;
  title?: string;
  sponsor?: string;
  athlete?: string;
  disbursedCents?: number;
  heldCents?: number;
  complianceStatus?: string;
  id?: string;
  clearinghouseStatus: ClearinghouseStatus;
  stripeMilestoneVerified: boolean;
  athleteInTransferPortal: boolean;
  regulatoryPlane: NilRegulatoryPlane;
}

function toRow(c: EscrowCampaignRecord): Record<string, unknown> {
  return {
    campaign_id: c.campaignId,
    sponsor_id: c.sponsorId,
    athlete_id: c.athleteId,
    amount_usd_cents: c.amountUsdCents,
    amount_usd_formatted: c.amountUsdFormatted,
    milestone_conditions: c.milestoneConditions ?? [],
    stripe_client_secret: c.stripeClientSecret,
    escrow_status: c.escrowStatus,
    title: c.title ?? null,
    sponsor: c.sponsor ?? null,
    athlete: c.athlete ?? null,
    disbursed_cents: c.disbursedCents ?? 0,
    held_cents: c.heldCents ?? 0,
    compliance_status: c.complianceStatus ?? null,
    clearinghouse_status: c.clearinghouseStatus,
    stripe_milestone_verified: c.stripeMilestoneVerified,
    athlete_in_transfer_portal: c.athleteInTransferPortal,
    regulatory_plane: c.regulatoryPlane,
    created_at: c.created_at,
    updated_at: new Date().toISOString(),
  };
}

function fromRow(row: Record<string, unknown>): EscrowCampaignRecord {
  return {
    id: String(row.campaign_id),
    campaignId: String(row.campaign_id),
    sponsorId: String(row.sponsor_id),
    athleteId: String(row.athlete_id),
    amountUsdCents: Number(row.amount_usd_cents) || 0,
    amountUsdFormatted: String(row.amount_usd_formatted),
    milestoneConditions: Array.isArray(row.milestone_conditions)
      ? row.milestone_conditions
      : [],
    stripeClientSecret: String(row.stripe_client_secret ?? ""),
    escrowStatus: String(row.escrow_status),
    created_at: String(row.created_at),
    title: row.title != null ? String(row.title) : undefined,
    sponsor: row.sponsor != null ? String(row.sponsor) : undefined,
    athlete: row.athlete != null ? String(row.athlete) : undefined,
    disbursedCents: Number(row.disbursed_cents) || 0,
    heldCents: Number(row.held_cents) || 0,
    complianceStatus:
      row.compliance_status != null ? String(row.compliance_status) : undefined,
    clearinghouseStatus: row.clearinghouse_status as ClearinghouseStatus,
    stripeMilestoneVerified: Boolean(row.stripe_milestone_verified),
    athleteInTransferPortal: Boolean(row.athlete_in_transfer_portal),
    regulatoryPlane: row.regulatory_plane as NilRegulatoryPlane,
  };
}

export async function persistEscrowCampaign(
  campaign: EscrowCampaignRecord,
): Promise<PersistResult> {
  const client = getServiceRoleClient();
  if (!client) {
    return {
      ok: false,
      upserted: 0,
      error: "SUPABASE_SERVICE_ROLE_KEY unset — escrow RAM only.",
    };
  }

  const { error } = await client
    .from("rallysafe_escrow_campaigns")
    .upsert(toRow(campaign), { onConflict: "campaign_id" });

  if (error) return { ok: false, upserted: 0, error: error.message };
  return { ok: true, upserted: 1 };
}

export async function listEscrowCampaigns(): Promise<EscrowCampaignRecord[]> {
  const client = getServiceRoleClient();
  if (!client) return [];

  const { data, error } = await client
    .from("rallysafe_escrow_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => fromRow(row as Record<string, unknown>));
}

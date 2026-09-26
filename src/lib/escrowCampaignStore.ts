/**
 * RAM/Postgres merge for Express RallySafe campaigns.
 * List already prefers Postgres; mutation paths must hydrate the same SOT
 * or they 404 after restart and can re-release seed rows over persisted RELEASED.
 */

export interface EscrowStoreIdentity {
  campaignId: string;
  id?: string;
  escrowStatus?: string;
}

export function matchesEscrowCampaignId(
  campaign: EscrowStoreIdentity,
  campaignId: string,
): boolean {
  return campaign.campaignId === campaignId || campaign.id === campaignId;
}

export function isEscrowAlreadyReleased(escrowStatus: string | undefined): boolean {
  return escrowStatus === "RELEASED";
}

/**
 * Prefer the Postgres row when present (authoritative after persist).
 * Overwrites a matching RAM seed so stale FUNDED seeds cannot beat RELEASED.
 * Falls back to RAM only when Postgres has no row (dev / no service role).
 */
export function hydrateEscrowStore<T extends EscrowStoreIdentity>(
  store: T[],
  fromPg: T | null | undefined,
  campaignId: string,
): T | undefined {
  if (fromPg) {
    const idx = store.findIndex((campaign) => matchesEscrowCampaignId(campaign, campaignId));
    if (idx >= 0) {
      store[idx] = fromPg;
      return store[idx];
    }
    store.push(fromPg);
    return store[store.length - 1];
  }
  return store.find((campaign) => matchesEscrowCampaignId(campaign, campaignId));
}

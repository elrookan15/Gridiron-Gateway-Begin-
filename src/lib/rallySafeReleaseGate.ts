import type { ClearinghouseStatus, PortalStatus, RallySafeReleaseSnapshot } from "../types";

export type RallySafeReleaseDenialCode =
  | "WRONG_REGULATORY_PLANE"
  | "TRANSFER_PORTAL_LOCK"
  | "CSC_NOT_CLEARED"
  | "CSC_FLAGGED"
  | "CSC_PENDING"
  | "STRIPE_HMAC_UNVERIFIED"
  | "ALREADY_RELEASED";

export type RallySafeReleaseDecision =
  | { ok: true }
  | { ok: false; code: RallySafeReleaseDenialCode };

/** Columns that exist on `public.nil_transactions` plus live portal tape. */
export interface LiveNilLedgerPayoutInput {
  clearinghouseStatus: ClearinghouseStatus;
  payoutReleased: boolean;
  athleteInActiveTransferPortal: boolean;
}

export function isActiveTransferPortalStatus(status: PortalStatus | string): boolean {
  return status === "ACTIVE";
}

/**
 * Enforceable subset for the SPA ledger (`NilTransaction`): CSC status,
 * already-released, and NCAA transfer-portal lock. Stripe HMAC / plane are
 * not stored on `nil_transactions`; `canReleaseNilEscrow` covers that richer snapshot.
 */
export function liveNilLedgerPayoutDecision(
  tx: LiveNilLedgerPayoutInput,
): RallySafeReleaseDecision {
  if (tx.athleteInActiveTransferPortal) {
    return { ok: false, code: "TRANSFER_PORTAL_LOCK" };
  }
  if (tx.clearinghouseStatus === "NOT_CLEARED") {
    return { ok: false, code: "CSC_NOT_CLEARED" };
  }
  if (tx.clearinghouseStatus === "FLAGGED_FOR_REVIEW") {
    return { ok: false, code: "CSC_FLAGGED" };
  }
  if (tx.clearinghouseStatus !== "CLEARED") {
    return { ok: false, code: "CSC_PENDING" };
  }
  if (tx.payoutReleased) {
    return { ok: false, code: "ALREADY_RELEASED" };
  }
  return { ok: true };
}

/**
 * Fail-closed escrow release predicate.
 * CLEARED + HMAC-verified milestone + not in portal + NIL Go plane.
 * Client UI may hide the button; this gate is the authority.
 */
export function canReleaseNilEscrow(tx: RallySafeReleaseSnapshot): RallySafeReleaseDecision {
  if (tx.regulatoryPlane !== "THIRD_PARTY_NIL_GO") {
    return { ok: false, code: "WRONG_REGULATORY_PLANE" };
  }
  const live = liveNilLedgerPayoutDecision({
    clearinghouseStatus: tx.clearinghouseStatus,
    payoutReleased: Boolean(tx.payoutReleased),
    athleteInActiveTransferPortal: tx.athleteInTransferPortal,
  });
  if (live.ok === false) {
    return live;
  }
  if (!tx.stripeMilestoneVerified) {
    return { ok: false, code: "STRIPE_HMAC_UNVERIFIED" };
  }
  return { ok: true };
}

/** CSC NIL Go reporting floor: $600 aggregate → 60_000 cents. */
export const NIL_GO_REPORTING_THRESHOLD_CENTS = 60_000;

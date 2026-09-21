import type { RallySafeReleaseSnapshot } from "../types";

export type RallySafeReleaseDenialCode =
  | "WRONG_REGULATORY_PLANE"
  | "TRANSFER_PORTAL_LOCK"
  | "CSC_NOT_CLEARED"
  | "CSC_FLAGGED"
  | "CSC_PENDING"
  | "STRIPE_HMAC_UNVERIFIED"
  | "ALREADY_RELEASED"
  | "BELOW_REPORTING_FLOOR";

export type RallySafeReleaseDecision =
  | { ok: true }
  | { ok: false; code: RallySafeReleaseDenialCode };

/**
 * Fail-closed escrow release predicate.
 * CLEARED + HMAC-verified milestone + not in portal + NIL Go plane.
 * Client UI may hide the button; this gate is the authority.
 */
export function canReleaseNilEscrow(tx: RallySafeReleaseSnapshot): RallySafeReleaseDecision {
  if (tx.regulatoryPlane !== "THIRD_PARTY_NIL_GO") {
    return { ok: false, code: "WRONG_REGULATORY_PLANE" };
  }
  if (tx.athleteInTransferPortal) {
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
  if (!tx.stripeMilestoneVerified) {
    return { ok: false, code: "STRIPE_HMAC_UNVERIFIED" };
  }
  if (
    !Number.isInteger(tx.dealAmountCents) ||
    tx.dealAmountCents < NIL_GO_REPORTING_THRESHOLD_CENTS
  ) {
    return { ok: false, code: "BELOW_REPORTING_FLOOR" };
  }
  return { ok: true };
}

/** CSC NIL Go reporting floor: $600 aggregate → 60_000 cents. Sub-floor deals are not inserted or released. */
export const NIL_GO_REPORTING_THRESHOLD_CENTS = 60_000;

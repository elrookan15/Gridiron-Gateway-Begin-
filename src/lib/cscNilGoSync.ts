import type { CscNilGoSyncComparison, CscNilGoSyncDecision } from "../types";

/**
 * Last-write-wins on CSC webhooks is unsafe: a delayed CLEARED retry can
 * overwrite a newer NOT_CLEARED and unlock RallySafe payout.
 *
 * Rule (must match `public.apply_csc_nil_go_sync`):
 * - incoming event_at < stored csc_event_at → STALE (ack, do not mutate)
 * - same event_at + same status → IDEMPOTENT retry
 * - otherwise APPLY
 */
export function decideCscNilGoSync(input: CscNilGoSyncComparison): CscNilGoSyncDecision {
  if (input.storedEventAtMs !== null && input.incomingEventAtMs < input.storedEventAtMs) {
    return "STALE";
  }
  if (
    input.storedEventAtMs !== null &&
    input.incomingEventAtMs === input.storedEventAtMs &&
    input.incomingStatus === input.storedStatus
  ) {
    return "IDEMPOTENT";
  }
  return "APPLY";
}

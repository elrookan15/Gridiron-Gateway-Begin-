/**
 * Fail-closed COPPA session bind.
 * parental_consents.athlete_id must equal the authenticated athlete JWT —
 * never a coach session or a labeled dossier id.
 */
export function bindConsentAthleteIdToSession(
  requestedAthleteId: string,
  sessionUserId: string | null | undefined,
): string {
  const requested = requestedAthleteId.trim();
  const sessionId = sessionUserId?.trim() ?? "";

  if (!sessionId) {
    throw new Error("Authentication required to record legal consent.");
  }
  if (!requested) {
    throw new Error("athleteId is required.");
  }
  if (requested !== sessionId) {
    throw new Error(
      "FAIL_CLOSED: consent athlete_id must match the authenticated athlete session.",
    );
  }

  return sessionId;
}

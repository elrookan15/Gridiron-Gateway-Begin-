import { bindConsentAthleteIdToSession } from "./lib/parentalConsentBind";

function runParentalConsentTestSuite() {
  console.log("==================================================");
  console.log("PARENTAL CONSENT SESSION BIND (fail-closed COPPA)");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(ok: boolean, name: string, detail?: string) {
    if (ok) {
      console.log(`  PASS: ${name}`);
      passed += 1;
    } else {
      console.error(`  FAIL: ${name} -> ${detail ?? ""}`);
      failed += 1;
    }
  }

  const athleteSession = "11111111-1111-4111-8111-111111111111";
  const coachSession = "22222222-2222-4222-8222-222222222222";

  assert(
    bindConsentAthleteIdToSession(athleteSession, athleteSession) === athleteSession,
    "Matching athlete JWT binds consent to that athlete",
  );

  try {
    bindConsentAthleteIdToSession("ath-2026-001", coachSession);
    assert(false, "Coach JWT cannot consent for a labeled dossier athlete");
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    assert(
      message.includes("FAIL_CLOSED"),
      "Coach JWT / dossier mismatch throws FAIL_CLOSED",
      message,
    );
  }

  try {
    bindConsentAthleteIdToSession(athleteSession, coachSession);
    assert(false, "Coach JWT cannot consent for a different athlete UUID");
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    assert(
      message.includes("FAIL_CLOSED"),
      "Cross-account athlete_id is denied",
      message,
    );
  }

  try {
    bindConsentAthleteIdToSession(athleteSession, null);
    assert(false, "Unauthenticated bind should throw");
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    assert(
      message.includes("Authentication required"),
      "Missing session is rejected",
      message,
    );
  }

  try {
    bindConsentAthleteIdToSession("   ", athleteSession);
    assert(false, "Blank athleteId should throw");
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    assert(message.includes("athleteId is required"), "Blank athleteId is rejected", message);
  }

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

runParentalConsentTestSuite();

import { bindConsentAthleteIdToSession } from "./lib/parentalConsentBind";
import { isParentalConsentPayloadValid, type ParentalConsentSubmitInput } from "./services/parentalConsentApi";

export function runParentalConsentTestSuite() {
  console.log("==================================================");
  console.log("🛡️ RUNNING PARENTAL CONSENT & COPPA MINOR PROTECTION SUITE");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, errorMessage?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName} -> ${errorMessage || "Assertion failed"}`);
      failedTests++;
    }
  }

  // Session Binding Tests
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

  // Payload Verification Tests
  const validPayload: ParentalConsentSubmitInput = {
    athleteId: "ath-2026-caden",
    parentName: "Sarah Carter",
    parentEmail: "sarah.carter@example.com",
    relationship: "MOTHER",
    coppaConsent: true,
    messagingConsent: true,
    biometricConsent: true,
    digitalSignature: "Sarah Carter",
  };

  assert(isParentalConsentPayloadValid(validPayload) === true, "Valid parental consent payload with matching signature allowed");

  assert(
    isParentalConsentPayloadValid({ ...validPayload, digitalSignature: "sarah carter" }) === true,
    "Case-insensitive matching digital signature allowed"
  );

  assert(
    isParentalConsentPayloadValid({ ...validPayload, digitalSignature: "John Smith" }) === false,
    "Signature mismatch defaults to fail-closed rejection"
  );

  assert(
    isParentalConsentPayloadValid({ ...validPayload, parentEmail: "invalid-email-no-at" }) === false,
    "Invalid email format rejected"
  );

  assert(
    isParentalConsentPayloadValid({ ...validPayload, coppaConsent: false }) === false,
    "Missing COPPA data processing consent rejected"
  );

  assert(
    isParentalConsentPayloadValid({ ...validPayload, messagingConsent: false }) === false,
    "Missing NCAA direct messaging authorization rejected"
  );

  assert(
    isParentalConsentPayloadValid({ ...validPayload, biometricConsent: false }) === false,
    "Missing TrueSpeed biometric release rejected"
  );

  assert(
    isParentalConsentPayloadValid({ ...validPayload, relationship: "" as any }) === false,
    "Empty guardian relationship rejected"
  );

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runParentalConsentTestSuite();

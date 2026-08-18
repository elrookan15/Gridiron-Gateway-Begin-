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

  // Test 1: Full Valid Consent Payload
  assert(isParentalConsentPayloadValid(validPayload) === true, "Valid parental consent payload with matching signature allowed");

  // Test 2: Case-Insensitive Matching Signature
  assert(
    isParentalConsentPayloadValid({ ...validPayload, digitalSignature: "sarah carter" }) === true,
    "Case-insensitive matching digital signature allowed"
  );

  // Test 3: Signature Mismatch (Fail-Closed)
  assert(
    isParentalConsentPayloadValid({ ...validPayload, digitalSignature: "John Smith" }) === false,
    "Signature mismatch defaults to fail-closed rejection"
  );

  // Test 4: Invalid Email Format
  assert(
    isParentalConsentPayloadValid({ ...validPayload, parentEmail: "invalid-email-no-at" }) === false,
    "Invalid email format rejected"
  );

  // Test 5: Missing COPPA Consent
  assert(
    isParentalConsentPayloadValid({ ...validPayload, coppaConsent: false }) === false,
    "Missing COPPA data processing consent rejected"
  );

  // Test 6: Missing Direct Messaging Consent
  assert(
    isParentalConsentPayloadValid({ ...validPayload, messagingConsent: false }) === false,
    "Missing NCAA direct messaging authorization rejected"
  );

  // Test 7: Missing Biometric Release
  assert(
    isParentalConsentPayloadValid({ ...validPayload, biometricConsent: false }) === false,
    "Missing TrueSpeed biometric release rejected"
  );

  // Test 8: Empty Guardian Relationship
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

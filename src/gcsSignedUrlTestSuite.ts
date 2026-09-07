import { generateGcsV4SignedUrl } from "./services/gcsSignedUrlService";

export function runGcsSignedUrlTestSuite() {
  console.log("==================================================");
  console.log("⚡ RUNNING GCS V4 SIGNED URL & COPPA SUITE");
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

  // Test 1: Adult Athlete Signed Upload URL Allowed
  const res1 = generateGcsV4SignedUrl({
    athleteId: "ath-adult-99",
    athleteAge: 20,
    parentalConsentSigned: false,
    objectPath: "highlights/2026_hudl_reel.mp4",
    httpMethod: "PUT",
    contentType: "video/mp4",
  });
  assert(res1.isAllowed === true && Boolean(res1.signedUrl), "Adult athlete (20yo) granted V4 signed upload URL");
  assert(res1.coppaStatus === "NOT_APPLICABLE", "COPPA status set to NOT_APPLICABLE for adult athlete");
  assert(res1.signedUrl?.includes("storage.googleapis.com"), "Signed URL points to storage.googleapis.com");

  // Test 2: Unverified Minor Recruit Direct Upload Blocked (Fail-Closed COPPA)
  const res2 = generateGcsV4SignedUrl({
    athleteId: "ath-minor-01",
    athleteAge: 16,
    parentalConsentSigned: false,
    objectPath: "highlights/2026_minor_film.mp4",
    httpMethod: "PUT",
    contentType: "video/mp4",
  });
  assert(res2.isAllowed === false, "Unverified minor recruit (16yo) upload URL blocked");
  assert(res2.coppaStatus === "MINOR_CONSENT_REQUIRED_FAIL_CLOSED", "COPPA status flags MINOR_CONSENT_REQUIRED_FAIL_CLOSED");
  assert(Boolean(res2.denyReason?.includes("STATUTORY_COMPLIANCE_LOCK")), "Deny reason contains STATUTORY_COMPLIANCE_LOCK");

  // Test 3: Verified Minor Recruit Upload Allowed
  const res3 = generateGcsV4SignedUrl({
    athleteId: "ath-minor-01",
    athleteAge: 16,
    parentalConsentSigned: true,
    objectPath: "highlights/2026_minor_film.mp4",
    httpMethod: "PUT",
    contentType: "video/mp4",
  });
  assert(res3.isAllowed === true && Boolean(res3.signedUrl), "Verified minor recruit (16yo with consent) granted upload URL");
  assert(res3.coppaStatus === "VERIFIED", "COPPA status set to VERIFIED");

  // Test 4: Missing Content-Type Rejected
  const res4 = generateGcsV4SignedUrl({
    athleteId: "ath-adult-99",
    athleteAge: 20,
    parentalConsentSigned: false,
    objectPath: "highlights/2026_film.mp4",
    httpMethod: "PUT",
    contentType: "",
  });
  assert(res4.isAllowed === false, "Missing content-type rejected");

  // Test 5: Custom Expiration Bounds Applied
  const res5 = generateGcsV4SignedUrl({
    athleteId: "ath-adult-99",
    athleteAge: 20,
    parentalConsentSigned: false,
    objectPath: "telemetry/catapult_gps_log.json",
    httpMethod: "GET",
    contentType: "application/json",
    expiresInSeconds: 3600,
  });
  assert(res5.isAllowed === true && Boolean(res5.expiresAtIso), "Custom 3600s expiration ISO timestamp generated");

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runGcsSignedUrlTestSuite();

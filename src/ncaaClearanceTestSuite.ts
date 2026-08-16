import { evaluateNcaaClearance } from "./complianceEngine";
import type { NcaaClearanceRequest } from "./types";

function runNcaaClearanceTestSuite() {
  console.log("==================================================");
  console.log("NCAA CLEARANCE ENGINE (fail-closed)");
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

  const base: NcaaClearanceRequest = {
    schoolId: "sch-fbs",
    coachId: "cch_test",
    athleteId: "ath_test",
    recruitAge: 18,
    hasParentalConsent: true,
    period: "CONTACT",
    actionType: "DIRECT_MESSAGE",
    contactMethod: "electronic",
    messagePayload: "Checking in on Friday night film.",
  };

  const cleared = evaluateNcaaClearance(base, false);
  assert(cleared.isCleared && cleared.status === "CLEARED", "Adult + CONTACT + clean payload → CLEARED");

  const minor = evaluateNcaaClearance({ ...base, recruitAge: 16, hasParentalConsent: false }, false);
  assert(minor.status === "BLOCKED_MINOR_CONSENT", "Minor without consent → BLOCKED_MINOR_CONSENT");

  const dead = evaluateNcaaClearance({ ...base, period: "DEAD" }, false);
  assert(dead.status === "BLOCKED_CALENDAR", "DEAD period blocks electronic → BLOCKED_CALENDAR");

  const inducement = evaluateNcaaClearance(
    { ...base, messagePayload: "We'll send cash and a free car if you commit." },
    false,
  );
  assert(
    inducement.status === "BLOCKED_INDUCEMENT" && inducement.flaggedKeywords.length > 0,
    "Inducement payload → BLOCKED_INDUCEMENT",
    inducement.status,
  );

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

runNcaaClearanceTestSuite();

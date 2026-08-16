import {
  evaluateNcaaClearance,
  evaluateMessagingClearance,
  getCurrentNcaaPeriod,
  scanForInducements,
} from "./complianceEngine";
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
    { ...base, messagePayload: "We can lock a signing bonus and guaranteed cash this week." },
    false,
  );
  assert(
    inducement.status === "BLOCKED_INDUCEMENT" && inducement.flaggedKeywords.includes("signing bonus"),
    "Inducement payload → BLOCKED_INDUCEMENT",
    inducement.status,
  );

  const minorBeatsInducement = evaluateMessagingClearance(
    16,
    false,
    "pay for play and a car deal",
    new Date(2026, 5, 15),
  );
  assert(
    minorBeatsInducement.status === "BLOCKED_MINOR_CONSENT",
    "Minor without consent short-circuits inducement scan",
    minorBeatsInducement.status,
  );

  assert(getCurrentNcaaPeriod(new Date(2026, 11, 20)) === "DEAD", "Dec 20 → DEAD");
  assert(getCurrentNcaaPeriod(new Date(2026, 4, 20)) === "EVALUATION", "May 20 → EVALUATION");
  assert(scanForInducements("free housing off campus").includes("free housing"), "scanForInducements hits free housing");

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

runNcaaClearanceTestSuite();

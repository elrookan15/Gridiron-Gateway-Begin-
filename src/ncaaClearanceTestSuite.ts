import {
  evaluateNcaaClearance,
  evaluateMessagingClearance,
  executeAndLogComplianceGate,
  getCurrentNcaaPeriod,
  resetComplianceAuditLedger,
  scanForInducements,
  setComplianceAuditPersister,
  COMPLIANCE_AUDIT_LEDGER,
} from "./complianceEngine";
import type { NcaaClearanceRequest } from "./types";

async function runNcaaClearanceTestSuite() {
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

  resetComplianceAuditLedger();
  setComplianceAuditPersister(null);
  const logged = await executeAndLogComplianceGate({
    schoolId: base.schoolId,
    coachId: base.coachId,
    athleteId: base.athleteId,
    athleteAge: base.recruitAge,
    hasParentalConsent: base.hasParentalConsent,
    messagePayload: base.messagePayload,
    actionType: base.actionType,
    evalDate: "2026-06-15T12:00:00.000Z",
  });
  assert(logged.isCleared === true && Boolean(logged.auditLogId), "executeAndLogComplianceGate CLEARED writes auditLogId");
  assert(
    COMPLIANCE_AUDIT_LEDGER[0]?.athleteId === base.athleteId &&
      COMPLIANCE_AUDIT_LEDGER[0]?.clearanceStatus === "CLEARED",
    "executeAndLogComplianceGate appends compliance audit ledger row",
  );

  setComplianceAuditPersister(async () => ({ ok: false, error: "forced ledger outage" }));
  const ledgerDown = await executeAndLogComplianceGate({
    schoolId: base.schoolId,
    coachId: base.coachId,
    athleteId: base.athleteId,
    athleteAge: 18,
    hasParentalConsent: true,
    messagePayload: "Clean check-in.",
    actionType: "DIRECT_MESSAGE",
    evalDate: "2026-06-15T12:00:00.000Z",
  });
  assert(
    ledgerDown.isCleared === false && ledgerDown.status === "BLOCKED_AUDIT_LEDGER",
    "Ledger write failure revokes clearance (fail-closed)",
    ledgerDown.status,
  );
  setComplianceAuditPersister(null);

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

void runNcaaClearanceTestSuite();

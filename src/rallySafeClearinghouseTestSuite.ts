import { canReleaseNilEscrow } from "./lib/rallySafeReleaseGate";
import type { RallySafeReleaseSnapshot } from "./types";

function runRallySafeClearinghouseTestSuite() {
  console.log("==================================================");
  console.log("RALLYSAFE FAIL-CLOSED CLEARINGHOUSE GATE");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, errorMessage?: string) {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  FAIL: ${testName} -> ${errorMessage || "Assertion failed"}`);
      failedTests++;
    }
  }

  const cleared: RallySafeReleaseSnapshot = {
    clearinghouseStatus: "CLEARED",
    stripeMilestoneVerified: true,
    athleteInTransferPortal: false,
    regulatoryPlane: "THIRD_PARTY_NIL_GO",
  };

  assert(canReleaseNilEscrow(cleared).ok === true, "CLEARED + HMAC + NIL Go → release allowed");

  assert(
    canReleaseNilEscrow({ ...cleared, clearinghouseStatus: "PENDING" }).ok === false,
    "PENDING defaults fail-closed",
  );

  const notCleared = canReleaseNilEscrow({ ...cleared, clearinghouseStatus: "NOT_CLEARED" });
  assert(
    notCleared.ok === false && notCleared.code === "CSC_NOT_CLEARED",
    "NOT_CLEARED is eligibility crisis, not a warning",
  );

  assert(
    canReleaseNilEscrow({ ...cleared, stripeMilestoneVerified: false }).ok === false,
    "CLEARED without Stripe HMAC still blocked",
  );

  assert(
    canReleaseNilEscrow({ ...cleared, athleteInTransferPortal: true }).ok === false,
    "Transfer portal lock blocks release",
  );

  assert(
    canReleaseNilEscrow({ ...cleared, regulatoryPlane: "INSTITUTIONAL_CAPS" }).ok === false,
    "CapGM / CAPS plane cannot release via RallySafe NIL Go",
  );

  console.log("==================================================");
  console.log(`RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runRallySafeClearinghouseTestSuite();

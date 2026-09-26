import { canReleaseNilEscrow } from "./lib/rallySafeReleaseGate";
import {
  hydrateEscrowStore,
  isEscrowAlreadyReleased,
} from "./lib/escrowCampaignStore";
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

  const alreadyReleased = canReleaseNilEscrow({ ...cleared, payoutReleased: true });
  assert(
    alreadyReleased.ok === false && alreadyReleased.code === "ALREADY_RELEASED",
    "Released campaigns cannot be released again",
  );
  assert(
    isEscrowAlreadyReleased("RELEASED") === true
      && isEscrowAlreadyReleased("FUNDED") === false,
    "RELEASED escrowStatus maps to payoutReleased",
  );

  const ramSeed = {
    campaignId: "esc-cleared",
    id: "esc-cleared",
    escrowStatus: "FUNDED",
  };
  const pgReleased = {
    campaignId: "esc-cleared",
    id: "esc-cleared",
    escrowStatus: "RELEASED",
  };
  const staleRam = [ramSeed];
  const hydrated = hydrateEscrowStore(staleRam, pgReleased, "esc-cleared");
  assert(
    hydrated?.escrowStatus === "RELEASED" && staleRam[0]?.escrowStatus === "RELEASED",
    "Postgres RELEASED overwrites stale RAM seed on hydrate",
  );

  const ramOnly = [{ campaignId: "esc-pending", escrowStatus: "FUNDED" }];
  const ramFallback = hydrateEscrowStore(ramOnly, null, "esc-pending");
  assert(
    ramFallback?.campaignId === "esc-pending",
    "RAM seed used when Postgres has no row",
  );

  const emptyStore: Array<{ campaignId: string; escrowStatus: string }> = [];
  const pgOnly = hydrateEscrowStore(
    emptyStore,
    { campaignId: "cmp_post_restart", escrowStatus: "FUNDED" },
    "cmp_post_restart",
  );
  assert(
    pgOnly?.campaignId === "cmp_post_restart" && emptyStore.length === 1,
    "Postgres-only campaign hydrates after process restart",
  );

  const missing = hydrateEscrowStore([], null, "cmp_unknown");
  assert(missing === undefined, "Unknown campaign stays missing (fail-closed 404)");

  console.log("==================================================");
  console.log(`RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runRallySafeClearinghouseTestSuite();

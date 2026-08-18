import { decideCscNilGoSync } from "./lib/cscNilGoSync";

function runCscNilGoSyncTestSuite() {
  console.log("==================================================");
  console.log("CSC NIL GO WEBHOOK MONOTONIC SYNC");
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

  const t0 = Date.parse("2026-08-18T11:00:00.000Z");
  const t1 = Date.parse("2026-08-18T11:00:30.000Z");

  assert(
    decideCscNilGoSync({
      storedEventAtMs: null,
      storedStatus: "PENDING",
      incomingEventAtMs: t0,
      incomingStatus: "CLEARED",
    }) === "APPLY",
    "First CSC event always applies",
  );

  assert(
    decideCscNilGoSync({
      storedEventAtMs: t0,
      storedStatus: "CLEARED",
      incomingEventAtMs: t1,
      incomingStatus: "NOT_CLEARED",
    }) === "APPLY",
    "Newer NOT_CLEARED supersedes CLEARED",
  );

  assert(
    decideCscNilGoSync({
      storedEventAtMs: t1,
      storedStatus: "NOT_CLEARED",
      incomingEventAtMs: t0,
      incomingStatus: "CLEARED",
    }) === "STALE",
    "Delayed CLEARED retry cannot overwrite newer NOT_CLEARED",
  );

  assert(
    decideCscNilGoSync({
      storedEventAtMs: t0,
      storedStatus: "CLEARED",
      incomingEventAtMs: t0,
      incomingStatus: "CLEARED",
    }) === "IDEMPOTENT",
    "Exact same event retry is idempotent",
  );

  assert(
    decideCscNilGoSync({
      storedEventAtMs: t0,
      storedStatus: "CLEARED",
      incomingEventAtMs: t0,
      incomingStatus: "NOT_CLEARED",
    }) === "APPLY",
    "Same timestamp with a corrected status still applies",
  );

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

runCscNilGoSyncTestSuite();

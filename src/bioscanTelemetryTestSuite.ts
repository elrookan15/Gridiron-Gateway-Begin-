import { applyBioscanWsUpdate, parseBioscanMetric } from "./lib/bioscanTelemetry";
import type { BioScanTelemetry } from "./types";

export function runBioscanTelemetryTestSuite() {
  console.log("==================================================");
  console.log("⚡ RUNNING BIOSCAN LIVE TELEMETRY INTEGRITY SUITE");
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

  const board: BioScanTelemetry[] = [
    {
      id: "bio-1",
      athleteName: "Derrick Vance Jr.",
      inGameMaxSprintMph: 22.8,
      accelerationRateMs2: 5.6,
      decelerationRateMs2: -6.4,
      playerLoadScore: 492.5,
      recoveryScorePercentage: 94,
      hardwareProvider: "Catapult Vector",
      lastSyncTimestamp: "seed",
    },
    {
      id: "bio-2",
      athleteName: "Malik Sanders",
      inGameMaxSprintMph: 23.1,
      accelerationRateMs2: 5.8,
      decelerationRateMs2: -6.8,
      playerLoadScore: 512.0,
      recoveryScorePercentage: 91,
      hardwareProvider: "WHOOP 4.0",
      lastSyncTimestamp: "seed",
    },
  ];

  // Rest / warmup packet must keep 0 MPH — never coerce to 22.8.
  assert(parseBioscanMetric(0) === 0, "Stationary 0 MPH is preserved (no 22.8 fabrication)");
  assert(parseBioscanMetric(18.4) === 18.4, "Positive Catapult velocity is preserved");
  assert(parseBioscanMetric(undefined) === 0, "Missing metric fails closed to 0, not a demo sprint");
  assert(parseBioscanMetric(-3) === 0, "Negative velocity is rejected");

  // Catapult packet for Malik must not overwrite Derrick's verified card.
  const malikLive = applyBioscanWsUpdate(
    board,
    { athleteId: "bio-2", currentSpeedMph: 18.0, cumulativeLoad: 220 },
    "Just now (Live WS Stream)",
  );
  const derrickAfterMalik = malikLive.find((row) => row.id === "bio-1");
  const malikAfterMalik = malikLive.find((row) => row.id === "bio-2");
  assert(
    derrickAfterMalik?.inGameMaxSprintMph === 22.8 && derrickAfterMalik.playerLoadScore === 492.5,
    "Foreign athlete packet does not paint onto bio-1",
  );
  assert(
    malikAfterMalik?.inGameMaxSprintMph === 18.0 && malikAfterMalik.playerLoadScore === 220,
    "Matching athlete card receives the Catapult frame",
  );

  // Rest packet for Derrick must write 0, not keep the previous sprint via || fallback.
  const derrickRest = applyBioscanWsUpdate(
    board,
    { athleteId: "bio-1", currentSpeedMph: 0, cumulativeLoad: 0 },
    "Just now (Live WS Stream)",
  );
  const derrickAfterRest = derrickRest.find((row) => row.id === "bio-1");
  const malikAfterRest = derrickRest.find((row) => row.id === "bio-2");
  assert(
    derrickAfterRest?.inGameMaxSprintMph === 0 && derrickAfterRest.playerLoadScore === 0,
    "0 MPH / 0 load rest packet overwrites prior sprint (nullish, not ||)",
  );
  assert(
    malikAfterRest?.inGameMaxSprintMph === 23.1,
    "Unrelated roster card is unchanged by a rest packet",
  );

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runBioscanTelemetryTestSuite();

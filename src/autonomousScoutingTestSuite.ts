import {
  calculateSchemeConfidence,
  isAlertDispatchValid,
  type SchemeScoutMetrics,
} from "./lib/autonomousScoutingEngine";
import type { SchemeFitScoutAlert } from "./types";

export function runAutonomousScoutingTestSuite() {
  console.log("==================================================");
  console.log("🤖 RUNNING AUTONOMOUS SCOUTING AI SCHEME FIT SUITE");
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

  const eliteMetrics: SchemeScoutMetrics = {
    trueSpeedMph: 22.8,
    cognitionScore: 98,
    laserShuttle: 4.02,
  };

  const averageMetrics: SchemeScoutMetrics = {
    trueSpeedMph: 20.2,
    cognitionScore: 75,
    laserShuttle: 4.35,
  };

  // Test 1: Elite Air Raid Confidence Scoring
  const airRaidScore = calculateSchemeConfidence("Air Raid", eliteMetrics);
  assert(airRaidScore >= 95, `Elite metrics achieve high Air Raid confidence (${airRaidScore}%)`);

  // Test 2: Average Metrics Confidence Scoring Bounded Lower
  const avgScore = calculateSchemeConfidence("Air Raid", averageMetrics);
  assert(avgScore === 70, `Average metrics default to baseline Air Raid confidence (${avgScore}%)`);

  // Test 3: West Coast Cognition Weighting
  const westCoastScore = calculateSchemeConfidence("West Coast", eliteMetrics);
  assert(westCoastScore >= 95, `High S2 Cognition boosts West Coast confidence (${westCoastScore}%)`);

  // Test 4: Valid Dispatch Alert Payload
  const validAlert: SchemeFitScoutAlert = {
    alertId: "alert-test-01",
    athleteId: "rec-2026-caden",
    athleteName: "Caden Davis",
    confidenceScore: 98,
    matchedScheme: "Air Raid",
    keyMetrics: {
      trueSpeedMph: 22.4,
      cognitionScore: 98,
      laserShuttle: 4.12,
    },
    timestamp: new Date().toISOString(),
  };
  assert(isAlertDispatchValid(validAlert) === true, "Valid scouting alert payload allowed for dispatch");

  // Test 5: Missing Athlete ID Payload
  assert(
    isAlertDispatchValid({ ...validAlert, athleteId: "" }) === false,
    "Missing athlete ID payload rejected"
  );

  // Test 6: Invalid Confidence Score (>100%)
  assert(
    isAlertDispatchValid({ ...validAlert, confidenceScore: 105 }) === false,
    "Out-of-bounds confidence score (>100%) rejected"
  );

  // Test 7: Invalid TrueSpeed Metric (<= 0)
  assert(
    isAlertDispatchValid({
      ...validAlert,
      keyMetrics: { ...validAlert.keyMetrics, trueSpeedMph: 0 },
    }) === false,
    "Invalid TrueSpeed metric (0 MPH) rejected"
  );

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAutonomousScoutingTestSuite();

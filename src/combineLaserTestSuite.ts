import {
  validateAndIngestLaserPacket,
  type LaserIngestionPayload,
} from "./lib/combineLaserEngine";

export function runCombineLaserTestSuite() {
  console.log("==================================================");
  console.log("⚡ RUNNING COMBINE LASER HARDWARE INGESTION SUITE");
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

  const validPayload: LaserIngestionPayload = {
    athleteName: "Tariq Lawson",
    athleteId: "rec_tariq_lawson",
    combineEventName: "Nike EYBL Showcase (Atlanta, GA)",
    laserFortyTime: 4.48,
    laserShuttleTime: 4.09,
    laserThreeConeTime: 6.79,
    verticalJumpInches: 37.0,
    broadJumpInches: 126.0,
  };

  // Test 1: Valid Laser Ingestion
  const result1 = validateAndIngestLaserPacket(validPayload);
  assert(result1.success === true, "Valid laser combine packet accepted and verified");
  assert(
    result1.ingestedEntry?.verifiedBy === "⚡ Laser Hardware Verified Ingress",
    "Verified badge assigned to ingested entry"
  );

  // Test 2: Impossible 40-Yard Dash (< 4.10s)
  const result2 = validateAndIngestLaserPacket({ ...validPayload, laserFortyTime: 3.50 });
  assert(result2.success === false && result2.errorCode === "INVALID_40_YARD_DASH", "Impossible 40-yard dash time (<4.10s) rejected");

  // Test 3: Abnormally Slow 40-Yard Dash (> 6.00s)
  const result3 = validateAndIngestLaserPacket({ ...validPayload, laserFortyTime: 6.50 });
  assert(result3.success === false && result3.errorCode === "INVALID_40_YARD_DASH", "Abnormally slow 40-yard dash time (>6.00s) rejected");

  // Test 4: Impossible Shuttle Time (< 3.80s)
  const result4 = validateAndIngestLaserPacket({ ...validPayload, laserShuttleTime: 3.20 });
  assert(result4.success === false && result4.errorCode === "INVALID_SHUTTLE_TIME", "Impossible 20-yard shuttle time (<3.80s) rejected");

  // Test 5: Impossible 3-Cone Time (< 6.40s)
  const result5 = validateAndIngestLaserPacket({ ...validPayload, laserThreeConeTime: 5.90 });
  assert(result5.success === false && result5.errorCode === "INVALID_3CONE_TIME", "Impossible 3-cone drill time (<6.40s) rejected");

  // Test 6: Out-of-Bounds Vertical Jump (> 50 inches)
  const result6 = validateAndIngestLaserPacket({ ...validPayload, verticalJumpInches: 55.0 });
  assert(result6.success === false && result6.errorCode === "INVALID_VERTICAL_JUMP", "Out-of-bounds vertical jump (>50 inches) rejected");

  // Test 7: Missing Athlete ID
  const result7 = validateAndIngestLaserPacket({ ...validPayload, athleteId: "" });
  assert(result7.success === false && result7.errorCode === "MISSING_ATHLETE_ID", "Missing athlete ID rejected");

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCombineLaserTestSuite();

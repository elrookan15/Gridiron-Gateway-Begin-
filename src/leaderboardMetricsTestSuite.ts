import { fortyYardSecondsFromMph } from "./lib/trueSpeedForty";

export function runLeaderboardMetricsTestSuite() {
  console.log("==================================================");
  console.log("📐 RUNNING LEADERBOARD TRUESPEED 40-YARD UNIT SUITE");
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

  // 22 mph constant-speed 40: 120 ft / (22 * 22/15 ft/s) = 1800/484 ≈ 3.72s
  const at22 = fortyYardSecondsFromMph(22);
  assert(at22 === 3.72, "22 mph converts to 3.72s 40-yard time", `got ${at22}`);
  assert(at22 !== 1.24, "22 mph must not use the yards/ft-s formula (1.24s)");

  // 21.5 mph: 1800 / (22 * 21.5) = 1800/473 ≈ 3.81s
  const at215 = fortyYardSecondsFromMph(21.5);
  assert(at215 === 3.81, "21.5 mph converts to 3.81s 40-yard time", `got ${at215}`);

  assert(fortyYardSecondsFromMph(0) === 0, "Zero velocity yields placeholder 0 (UI em-dash)");
  assert(fortyYardSecondsFromMph(-4) === 0, "Negative velocity is rejected");
  assert(fortyYardSecondsFromMph(Number.NaN) === 0, "NaN velocity is rejected");

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runLeaderboardMetricsTestSuite();

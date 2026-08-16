import {
  DEFAULT_NIL_INPUT,
  estimateNilValuationCents,
  formatUsdFromCents,
} from "./lib/nilValuation";

function runNilValuationTestSuite() {
  console.log("==================================================");
  console.log("NIL VALUATION INTEGER-CENTS UNIT TEST SUITE");
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

  const baseline = estimateNilValuationCents(DEFAULT_NIL_INPUT);
  assert(
    baseline.athleticCents === 25_000_000,
    "4-star P4 QB athletic = $250,000",
    `got ${baseline.athleticCents}`,
  );
  assert(
    baseline.socialCents === 57_400,
    "15k followers @ 4.5% social dollar-round = $574",
    `got ${baseline.socialCents}`,
  );
  assert(
    baseline.totalCents === 25_057_400,
    "baseline total cents",
    `got ${baseline.totalCents}`,
  );

  const d3Kicker = estimateNilValuationCents({
    division: "D3",
    position: "SPECIAL",
    stars: 1,
    followers: 0,
    engagementTenths: 1,
  });
  assert(
    d3Kicker.athleticCents === 2_500,
    "1-star D3 specialist athletic = $25",
    `got ${d3Kicker.athleticCents}`,
  );
  assert(d3Kicker.socialCents === 0, "zero followers → zero social cents");

  const clamped = estimateNilValuationCents({
    ...DEFAULT_NIL_INPUT,
    followers: 999_999_999,
  });
  const atCap = estimateNilValuationCents({
    ...DEFAULT_NIL_INPUT,
    followers: 500_000,
  });
  assert(
    clamped.socialCents === atCap.socialCents,
    "followers clamp at 500k",
  );

  assert(formatUsdFromCents(25_057_400) === "$250,574", "USD formatter");

  console.log("==================================================");
  console.log(`RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runNilValuationTestSuite();

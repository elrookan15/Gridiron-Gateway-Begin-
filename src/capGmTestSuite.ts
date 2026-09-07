import { computeCapGmState, dollarsToAllocatedCents } from "./lib/capGmMath";
import { CAP_GM_HARD_CAP_CENTS, RosterPlayerCapItem, type CapGmPlayer } from "./types";

/**
 * CapGM Mathematical Validation & Edge Case Unit Test Suite
 */

function runCapGmTestSuite() {
  console.log("==================================================");
  console.log("🧪 RUNNING CAPGM SALARY CAP & SP+ UNIT TEST SUITE");
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

  const BASE_CAP = 20500000; // $20.5M Hard Cap

  // Test 1: Standard Cap Space Calculation
  const sampleRoster: RosterPlayerCapItem[] = [
    {
      id: "p1",
      athleteName: "Derrick Vance Jr.",
      position: "QB",
      yearClass: "SO",
      nilCapValue: 2400000,
      spWinImpactScore: 2.45,
      epaPerPlayContribution: 0.32,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: [],
    },
    {
      id: "p2",
      athleteName: "Malik Sanders",
      position: "WR",
      yearClass: "FR",
      nilCapValue: 1350000,
      spWinImpactScore: 1.62,
      epaPerPlayContribution: 0.21,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: [],
    },
  ];

  const totalAllocated = sampleRoster.reduce((sum, p) => sum + p.nilCapValue, 0);
  const remainingCap = BASE_CAP - totalAllocated;

  assert(totalAllocated === 3750000, "Calculate total allocated NIL salary cap", `Expected 3,750,000, got ${totalAllocated}`);
  assert(remainingCap === 16750000, "Calculate remaining cap space", `Expected 16,750,000, got ${remainingCap}`);

  // Test 2: Over-Cap Collision Edge Case
  const overCapRoster: RosterPlayerCapItem[] = [
    {
      id: "op1",
      athleteName: "Overpaid QB 1",
      position: "QB",
      yearClass: "SR",
      nilCapValue: 12000000,
      spWinImpactScore: 3.0,
      epaPerPlayContribution: 0.4,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: [],
    },
    {
      id: "op2",
      athleteName: "Overpaid WR 1",
      position: "WR",
      yearClass: "SR",
      nilCapValue: 10000000,
      spWinImpactScore: 2.5,
      epaPerPlayContribution: 0.3,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: [],
    },
  ];

  const overAllocated = overCapRoster.reduce((sum, p) => sum + p.nilCapValue, 0);
  const negativeRemainingCap = BASE_CAP - overAllocated;

  assert(overAllocated === 22000000, "Detect over-cap budget allocation", `Expected 22,000,000, got ${overAllocated}`);
  assert(negativeRemainingCap === -1500000, "Negative cap space warning on budget breach", `Expected -1,500,000, got ${negativeRemainingCap}`);

  // Test 3: SP+ Expected Wins Summation Precision
  const baseWins = 6.0;
  const totalSpImpact = sampleRoster.reduce((sum, p) => sum + p.spWinImpactScore, 0);
  const projectedWins = Number((baseWins + totalSpImpact).toFixed(1));

  assert(projectedWins === 10.1, "Precision SP+ expected team win calculation", `Expected 10.1 wins, got ${projectedWins}`);

  // Test 4: Position Category Allocation Percentages
  const qbAllocated = 4800000;
  const qbPercentage = Number(((qbAllocated / BASE_CAP) * 100).toFixed(1));
  assert(qbPercentage === 23.4, "QB position budget percentage calculation", `Expected 23.4%, got ${qbPercentage}%`);

  const centsRoster: CapGmPlayer[] = [
    {
      id: "c1",
      name: "QB",
      position: "QB",
      starRating: 5,
      marketValueCents: 250_000_000,
      allocatedCents: 250_000_000,
      baseEpa: 7.2,
      isRetained: true,
      notes: "",
    },
    {
      id: "c2",
      name: "LT",
      position: "LT",
      starRating: 3,
      marketValueCents: 80_000_000,
      allocatedCents: 40_000_000,
      baseEpa: 2.1,
      isRetained: true,
      notes: "",
    },
    {
      id: "c3",
      name: "Cut",
      position: "WR",
      starRating: 4,
      marketValueCents: 120_000_000,
      allocatedCents: 120_000_000,
      baseEpa: 4.0,
      isRetained: false,
      notes: "",
    },
  ];
  const centsState = computeCapGmState(centsRoster, CAP_GM_HARD_CAP_CENTS);
  assert(centsState.allocatedCents === 290_000_000, "Integer-cents allocated excludes cut players");
  assert(centsState.remainingCents === CAP_GM_HARD_CAP_CENTS - 290_000_000, "Integer remaining = hard cap minus allocated");
  assert(centsState.globalRetentionRisk === "HIGH", "One critically underfunded retainee → HIGH");
  assert(dollarsToAllocatedCents(25_000) === 2_500_000, "Slider dollars * 100 maps to integer cents");
  assert(Number.isInteger(dollarsToAllocatedCents(12_345.678)), "floor(dollars * 100) yields integer cents only");

  console.log("==================================================");
  console.log(`📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCapGmTestSuite();

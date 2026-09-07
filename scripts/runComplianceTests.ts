import { runComplianceTestSuite } from "../src/complianceTestSuite";

console.log("🛡️ Running Gridiron Gateway Fail-Closed Compliance Test Suite...\n");

const results = runComplianceTestSuite();
let passCount = 0;
let failCount = 0;

results.forEach((test) => {
  const icon = test.verdict === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${test.id}] ${test.title} (${test.group}): ${test.verdict}`);
  if (test.verdict === "PASS") {
    passCount++;
  } else {
    failCount++;
    console.error(`   Details: ${test.details}`);
  }
});

console.log(`\n📊 Compliance Test Suite Results: ${passCount}/${results.length} PASSED`);

if (failCount > 0) {
  console.error(`🚨 FAIL-CLOSED COMPLIANCE BLOCK: ${failCount} tests failed. Aborting commit pipeline.`);
  process.exit(1);
} else {
  console.log("🟢 All NCAA Compliance fail-closed rules verified.");
  process.exit(0);
}

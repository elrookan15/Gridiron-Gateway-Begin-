import { execSync } from "child_process";

console.log("⚡ ==================================================");
console.log("⚡ GRIDIRON GATEWAY & RALLYSAFE PRE-COMMIT SUITE");
console.log("⚡ ==================================================\n");

try {
  console.log("1️⃣ Executing TypeScript Strict Compilation Check (tsc --noEmit)...");
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✅ TypeScript Compilation Passed (0 Errors).\n");

  console.log("2️⃣ Executing NCAA Statutory Compliance Test Suite (10/10 Fail-Closed)...");
  execSync("npx tsx scripts/runComplianceTests.ts", { stdio: "inherit" });
  console.log("");

  console.log("3️⃣ Executing RallySafe NIL Escrow Clearinghouse Test Suite...");
  execSync("npx tsx src/rallySafeClearinghouseTestSuite.ts", { stdio: "inherit" });
  console.log("");

  console.log("⚡ ==================================================");
  console.log("🟢 ALL PRE-COMMIT STATUTORY & TYPE CHECKS PASSED");
  console.log("⚡ ==================================================");
  process.exit(0);
} catch (error) {
  console.error("\n🚨 PRE-COMMIT SUITE FAILURE: One or more quality gates failed. Aborting commit.");
  process.exit(1);
}

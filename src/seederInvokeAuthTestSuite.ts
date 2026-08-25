import { evaluateSeederInvokeAuth } from "./lib/seederInvokeAuth";

export function runSeederInvokeAuthTestSuite() {
  console.log("==================================================");
  console.log("CFBD SEEDER INVOKE AUTHZ (FAIL-CLOSED)");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, errorMessage?: string) {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passedTests += 1;
    } else {
      console.error(`  FAIL: ${testName} -> ${errorMessage || "Assertion failed"}`);
      failedTests += 1;
    }
  }

  const unset = evaluateSeederInvokeAuth(undefined, "any-header");
  assert(
    unset.ok === false && unset.httpStatus === 503,
    "Missing SEEDER_INVOKE_SECRET fails closed (503), does not allow service_role upsert",
  );

  const blank = evaluateSeederInvokeAuth("   ", "   ");
  assert(
    blank.ok === false && blank.httpStatus === 503,
    "Whitespace-only SEEDER_INVOKE_SECRET is treated as unset",
  );

  const missingHeader = evaluateSeederInvokeAuth("seeder-secret-2026", undefined);
  assert(
    missingHeader.ok === false && missingHeader.httpStatus === 401,
    "Configured secret without x-seeder-secret header is 401",
  );

  const wrong = evaluateSeederInvokeAuth("seeder-secret-2026", "seeder-secret-0000");
  assert(
    wrong.ok === false && wrong.httpStatus === 401,
    "Mismatched x-seeder-secret is 401",
  );

  const prefix = evaluateSeederInvokeAuth("seeder-secret-2026", "seeder-secret");
  assert(
    prefix.ok === false && prefix.httpStatus === 401,
    "Prefix / length-mismatched secret is 401",
  );

  const ok = evaluateSeederInvokeAuth("seeder-secret-2026", "seeder-secret-2026");
  assert(ok.ok === true, "Matching x-seeder-secret is allowed");

  const trimmed = evaluateSeederInvokeAuth("  seeder-secret-2026  ", "seeder-secret-2026");
  assert(trimmed.ok === true, "Surrounding whitespace on the configured secret is trimmed");

  console.log("==================================================");
  console.log(`RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSeederInvokeAuthTestSuite();

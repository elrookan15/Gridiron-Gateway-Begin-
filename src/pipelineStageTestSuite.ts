import {
  buildPipelineStagePatch,
  derivePipelineStage,
  isSignedNliStatus,
  OFFICIAL_VISIT_TAG,
} from "./services/schoolsApi";

export function runPipelineStageTestSuite() {
  console.log("==================================================");
  console.log("🛡️ RUNNING PIPELINE STAGE / SIGNED NLI IMMUTABILITY SUITE");
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

  assert(isSignedNliStatus("Signed") === true, "Signed (canonical enum) is an NLI lock");
  assert(isSignedNliStatus("SIGNED") === true, "Signed match is case-insensitive");
  assert(isSignedNliStatus("Committed") === false, "Verbal Committed is not an NLI lock");
  assert(isSignedNliStatus("Uncommitted") === false, "Uncommitted is not an NLI lock");

  assert(
    derivePipelineStage("Signed", true, null) === "Committed",
    "Signed NLI renders in the Committed Kanban column",
  );
  assert(
    derivePipelineStage("Committed", true, null) === "Committed",
    "Verbal Committed renders in the Committed column",
  );
  assert(
    derivePipelineStage("Uncommitted", true, `${OFFICIAL_VISIT_TAG} host family`) === "Official Visit",
    "OV notes tag maps Uncommitted official offers to Official Visit",
  );

  const verbalAdvance = buildPipelineStagePatch("Committed", "Host family TBD", "Uncommitted");
  assert(
    verbalAdvance.commitment_status === "Committed" && verbalAdvance.is_official === true,
    "Advancing a verbal prospect writes Committed",
  );

  const signedStay = buildPipelineStagePatch("Committed", "NLI filed", "Signed");
  assert(
    signedStay.commitment_status === "Signed",
    "Re-writing Committed for a Signed offer preserves Signed (does not downgrade to Committed)",
  );

  let regressThrew = false;
  let regressMessage = "";
  try {
    buildPipelineStagePatch("Official Visit", "NLI filed", "Signed");
  } catch (err) {
    regressThrew = true;
    regressMessage = err instanceof Error ? err.message : "";
  }
  assert(regressThrew && regressMessage.includes("FAIL_CLOSED"), "Regressing Signed → Official Visit throws FAIL_CLOSED");

  let evaluatingThrew = false;
  try {
    buildPipelineStagePatch("Evaluating", null, "signed");
  } catch {
    evaluatingThrew = true;
  }
  assert(evaluatingThrew, "Regressing Signed → Evaluating throws (lowercase signed)");

  const verbalRegress = buildPipelineStagePatch("Official Visit", "film notes", "Committed");
  assert(
    verbalRegress.commitment_status === "Uncommitted" &&
      verbalRegress.notes?.includes(OFFICIAL_VISIT_TAG) === true,
    "Verbal Committed may regress to Official Visit (Uncommitted + OV tag)",
  );

  const offeredPatch = buildPipelineStagePatch("Offered", `${OFFICIAL_VISIT_TAG} campus tour`, "Uncommitted");
  assert(
    offeredPatch.commitment_status === "Uncommitted" &&
      offeredPatch.is_official === true &&
      offeredPatch.notes === "campus tour",
    "Offered stage strips the OV tag and keeps staff notes",
  );

  console.log("==================================================");
  if (failedTests > 0) {
    console.error(`❌ PIPELINE STAGE SUITE FAILED: ${failedTests} failed, ${passedTests} passed.`);
    process.exit(1);
  }
  console.log(`✅ PIPELINE STAGE SUITE PASSED: ${passedTests}/13 NLI immutability checks.`);
  console.log("==================================================");
}

runPipelineStageTestSuite();

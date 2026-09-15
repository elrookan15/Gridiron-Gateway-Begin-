/**
 * Pipeline Kanban write gate — 0-row PostgREST updates must fail closed.
 */
import assert from "node:assert/strict";
import { assertPipelineStageWriteReturned } from "./services/schoolsApi";

let failures = 0;

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

const OFFER_ID = "11111111-1111-4111-8111-111111111111";

check("assertPipelineStageWriteReturned accepts matching id", () => {
  assertPipelineStageWriteReturned({ id: OFFER_ID }, OFFER_ID);
});

check("assertPipelineStageWriteReturned rejects null (RLS / 0-row UPDATE)", () => {
  assert.throws(
    () => assertPipelineStageWriteReturned(null, OFFER_ID),
    /no row returned/,
  );
});

check("assertPipelineStageWriteReturned rejects empty object", () => {
  assert.throws(
    () => assertPipelineStageWriteReturned({}, OFFER_ID),
    /no row returned/,
  );
});

check("assertPipelineStageWriteReturned rejects mismatched id", () => {
  assert.throws(
    () =>
      assertPipelineStageWriteReturned(
        { id: "22222222-2222-4222-8222-222222222222" },
        OFFER_ID,
      ),
    /no row returned/,
  );
});

if (failures > 0) {
  console.error(`\nPipeline offer write suite: ${failures} failure(s)`);
  process.exit(1);
}
console.log("\nPipeline offer write suite: all checks passed");

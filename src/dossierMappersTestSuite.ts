/**
 * Dossier offer-school mapper gates (no live Supabase required).
 */
import assert from "node:assert/strict";
import {
  mapProductionOfferSchool,
  unwrapOne,
} from "./lib/dossierMappers";

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

check("unwrapOne prefers first array element", () => {
  assert.equal(unwrapOne([1, 2]), 1);
  assert.equal(unwrapOne(null), null);
  assert.equal(unwrapOne(7), 7);
});

check("mapProductionOfferSchool maps cfbd school_id → id/name", () => {
  const view = mapProductionOfferSchool({
    school_id: "cfbd-251",
    institution_name: "University of Texas",
    primary_color: "#BF5700",
    abbreviation: "TEX",
  });
  assert.deepEqual(view, {
    id: "cfbd-251",
    name: "University of Texas",
    primary_color: "#BF5700",
    abbreviation: "TEX",
  });
});

check("mapProductionOfferSchool rejects blank institution", () => {
  assert.equal(
    mapProductionOfferSchool({
      school_id: "cfbd-1",
      institution_name: "  ",
    }),
    null,
  );
});

check("mapProductionOfferSchool does not invent colors", () => {
  const view = mapProductionOfferSchool({
    school_id: "cfbd-333",
    institution_name: "Alabama",
  });
  assert.equal(view?.primary_color, null);
  assert.equal(view?.abbreviation, null);
});

if (failures > 0) {
  console.error(`\nDossier mapper suite: ${failures} failure(s)`);
  process.exit(1);
}
console.log("\nDossier mapper suite: all checks passed");

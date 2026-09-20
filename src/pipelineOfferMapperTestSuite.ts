/**
 * Pipeline Kanban mapper gate — production athlete_id facts, not MVP users.
 */
import assert from "node:assert/strict";
import {
  derivePipelineStage,
  mapPipelineOffer,
  type PipelineAthleteFactsRow,
  type PipelineOfferBaseRow,
} from "./lib/pipelineOfferMappers";

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

const offer: PipelineOfferBaseRow = {
  id: "off-1",
  school_id: "cfbd-251",
  athlete_id: "ath-derrick-vance",
  is_official: true,
  offer_date: "2026-09-01",
  commitment_status: "Uncommitted",
  notes: null,
};

const athlete: PipelineAthleteFactsRow = {
  athlete_id: "ath-derrick-vance",
  first_name: "Derrick",
  last_name: "Vance-Montgomery",
  primary_position: "WR",
  star_rating: 4,
};

check("mapPipelineOffer keys id to production athlete_id (not user_id)", () => {
  const card = mapPipelineOffer(offer, athlete);
  assert.equal(card.id, "off-1");
  assert.equal(card.schoolId, "cfbd-251");
  assert.equal(card.athleteId, "ath-derrick-vance");
  assert.equal(card.athleteName, "Derrick Vance-Montgomery");
  assert.equal(card.position, "WR");
  assert.equal(card.starRating, 4);
  assert.equal(card.stage, "Offered");
});

check("missing athlete facts fail open to Unknown Athlete (board still loads)", () => {
  const card = mapPipelineOffer(offer, null);
  assert.equal(card.athleteId, "ath-derrick-vance");
  assert.equal(card.athleteName, "Unknown Athlete");
  assert.equal(card.position, "ATH");
  assert.equal(card.starRating, 0);
});

check("derivePipelineStage: signed/committed stay Committed", () => {
  assert.equal(derivePipelineStage("Signed", true, null), "Committed");
  assert.equal(derivePipelineStage("Committed", false, null), "Committed");
});

check("derivePipelineStage: official-visit notes beat is_official", () => {
  assert.equal(
    derivePipelineStage("Uncommitted", true, "[pipeline:Official Visit] film"),
    "Official Visit",
  );
});

check("derivePipelineStage: committed status wins over official-visit notes", () => {
  assert.equal(
    derivePipelineStage("Committed", true, "[pipeline:Official Visit]"),
    "Committed",
  );
});

if (failures > 0) {
  console.error(`\nPipeline offer mapper suite: ${failures} failure(s)`);
  process.exit(1);
}

console.log("\nPipeline offer mapper suite: all checks passed");

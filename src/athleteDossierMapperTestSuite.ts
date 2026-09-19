/**
 * Dossier mapper gate — production athlete_profiles → AthleteProfileModal.
 * Invariant: Top 250 athlete_id is the dossier lookup key (never MVP user_id).
 */
import assert from "node:assert/strict";
import type { DatabaseAthleteProfile } from "./types";
import {
  mapProductionAthleteToFullProfile,
  mapProductionOfferSchool,
} from "./lib/athleteDossierMappers";

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

const sampleAthlete: DatabaseAthleteProfile = {
  athleteId: "ath_derrick_vance",
  firstName: "Derrick",
  lastName: "Vance",
  gradYear: 2027,
  primaryPosition: "WR",
  state: "TX",
  starRating: 4,
  trueSpeedMph: 22.8,
  cognitionScore: 81,
};

check("mapProductionAthleteToFullProfile keys dossier id to production athlete_id", () => {
  const profile = mapProductionAthleteToFullProfile(sampleAthlete);
  assert.equal(profile.id, "ath_derrick_vance");
  assert.equal(profile.first_name, "Derrick");
  assert.equal(profile.last_name, "Vance");
  assert.equal(profile.position_tier, "WR");
  assert.equal(profile.star_rating, 4);
});

check("mapProductionAthleteToFullProfile does not invent measurables or media", () => {
  const profile = mapProductionAthleteToFullProfile(sampleAthlete);
  assert.equal(profile.height_inches, null);
  assert.equal(profile.weight_lbs, null);
  assert.equal(profile.forty_yard_dash, null);
  assert.equal(profile.vertical_jump_inches, null);
  assert.equal(profile.media, null);
  assert.deepEqual(profile.offers, []);
});

check("mapProductionAthleteToFullProfile preserves verified offers", () => {
  const offers = [
    {
      id: "off-1",
      is_official: true,
      offer_date: "2026-09-01",
      commitment_status: "Uncommitted",
      school: {
        id: "cfbd-251",
        name: "University of Texas",
        primary_color: "#BF5700",
        abbreviation: "TEX",
      },
    },
  ];
  const profile = mapProductionAthleteToFullProfile(sampleAthlete, offers);
  assert.equal(profile.offers.length, 1);
  assert.equal(profile.offers[0].school?.id, "cfbd-251");
});

check("mapProductionOfferSchool reads school_id / institution_name (not MVP id/name)", () => {
  const school = mapProductionOfferSchool({
    school_id: "cfbd-251",
    institution_name: "University of Texas",
    primary_color: "#BF5700",
    abbreviation: "TEX",
  });
  assert.equal(school?.id, "cfbd-251");
  assert.equal(school?.name, "University of Texas");
  assert.equal(school?.abbreviation, "TEX");
});

check("mapProductionOfferSchool unwraps PostgREST array embeds", () => {
  const school = mapProductionOfferSchool([
    {
      school_id: "cfbd-99",
      institution_name: "Example State",
      primary_color: null,
      abbreviation: null,
    },
  ]);
  assert.equal(school?.id, "cfbd-99");
  assert.equal(school?.name, "Example State");
});

check("mapProductionOfferSchool refuses incomplete production embeds", () => {
  assert.equal(mapProductionOfferSchool(null), null);
  assert.equal(
    mapProductionOfferSchool({
      school_id: "",
      institution_name: "Nameless",
    }),
    null,
  );
  assert.equal(
    mapProductionOfferSchool({
      school_id: "cfbd-1",
      institution_name: "   ",
    }),
    null,
  );
});

if (failures > 0) {
  console.error(`\nAthlete dossier mapper suite: ${failures} failure(s)`);
  process.exit(1);
}

console.log("\nAthlete dossier mapper suite: all checks passed");

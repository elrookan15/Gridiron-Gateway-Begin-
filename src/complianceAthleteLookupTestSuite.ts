/**
 * COPPA messaging-gate lookup — client age/consent must not override Postgres.
 */
import assert from "node:assert/strict";
import { evaluateMessagingClearance } from "./complianceEngine";
import {
  ageFromDob,
  gateFactsFromAthleteRow,
} from "./lib/complianceAthleteLookup";

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

const NOW = new Date("2026-09-17T12:00:00.000Z");

function main(): void {
  check("ageFromDob: 16th birthday already passed this year", () => {
    assert.equal(ageFromDob(new Date("2010-03-01T00:00:00.000Z"), NOW), 16);
  });

  check("ageFromDob: day before 18th birthday is still 17", () => {
    assert.equal(ageFromDob(new Date("2008-09-18T00:00:00.000Z"), NOW), 17);
  });

  check("ageFromDob: 18th birthday on eval day is 18", () => {
    assert.equal(ageFromDob(new Date("2008-09-17T00:00:00.000Z"), NOW), 18);
  });

  check("ageFromDob: invalid Date is fail-closed 0", () => {
    assert.equal(ageFromDob(new Date(Number.NaN), NOW), 0);
  });

  check("missing profile row is minor without consent", () => {
    const facts = gateFactsFromAthleteRow(null, NOW);
    assert.equal(facts.athleteAge, 0);
    assert.equal(facts.hasParentalConsent, false);
  });

  check("null DOB is fail-closed minor even if a client would claim 18", () => {
    const facts = gateFactsFromAthleteRow(
      { date_of_birth: null, contact_authorized: false },
      NOW,
    );
    assert.equal(facts.athleteAge, 0);
    assert.equal(facts.hasParentalConsent, false);
  });

  check("minor DOB ignores contact_authorized false (COPPA lock)", () => {
    const facts = gateFactsFromAthleteRow(
      { date_of_birth: "2010-06-01", contact_authorized: false },
      NOW,
    );
    assert.equal(facts.athleteAge, 16);
    assert.equal(facts.hasParentalConsent, false);
  });

  check("minor with parental_consents flip (contact_authorized true) is 16 + consent", () => {
    const facts = gateFactsFromAthleteRow(
      { date_of_birth: "2010-06-01", contact_authorized: true },
      NOW,
    );
    assert.equal(facts.athleteAge, 16);
    assert.equal(facts.hasParentalConsent, true);
  });

  check("adult DOB does not need consent to clear the minor gate", () => {
    const facts = gateFactsFromAthleteRow(
      { date_of_birth: "2006-01-01", contact_authorized: false },
      NOW,
    );
    assert.equal(facts.athleteAge, 20);
    assert.equal(facts.hasParentalConsent, false);
  });

  check("null contact_authorized is not consent", () => {
    const facts = gateFactsFromAthleteRow(
      { date_of_birth: "2010-06-01", contact_authorized: null },
      NOW,
    );
    assert.equal(facts.athleteAge, 16);
    assert.equal(facts.hasParentalConsent, false);
  });

  check("spoofed client age 18 / consent true cannot clear a 16-year-old without DB consent", () => {
    const facts = gateFactsFromAthleteRow(
      { date_of_birth: "2010-06-01", contact_authorized: false },
      NOW,
    );
    const evaluation = evaluateMessagingClearance(
      facts.athleteAge,
      facts.hasParentalConsent,
      "Checking in on Friday night film.",
      NOW,
    );
    assert.equal(evaluation.status, "BLOCKED_MINOR_CONSENT");
    assert.equal(evaluation.isCleared, false);
  });

  check("same spoofed client flags WOULD have cleared on raw client age 18", () => {
    const spoofed = evaluateMessagingClearance(
      18,
      true,
      "Checking in on Friday night film.",
      NOW,
    );
    assert.equal(spoofed.isCleared, true);
  });

  if (failures > 0) {
    console.error(`\nCOPPA athlete lookup suite: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log("\nCOPPA athlete lookup suite: all checks passed");
}

main();

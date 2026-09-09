/**
 * Directory mapper unit gate — production schools/coaches → SPA cards.
 * Invariant: recruiting contacts stay null unless Sidearm/CSV verified.
 */
import assert from "node:assert/strict";
import type { DatabaseSchool } from "./types";
import {
  mapDatabaseSchoolToDirectoryCard,
  mapDatabaseSchoolToGatewayCard,
  mapDirectoryCoachToProfile,
  tierToCollegeDivision,
  type DirectoryCoachJoined,
} from "./lib/directoryMappers";

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

const sampleSchool: DatabaseSchool = {
  schoolId: "cfbd-251",
  institutionName: "University of Texas",
  mascot: "Longhorns",
  abbreviation: "TEX",
  tier: "FBS_POWER_4",
  conference: "SEC",
  city: "Austin",
  state: "TX",
  primaryColor: "#BF5700",
  secondaryColor: "#FFFFFF",
  stadiumCapacity: 100119,
  lastSyncedAt: "2026-09-01T00:00:00.000Z",
};

check("tierToCollegeDivision maps Power 4 + G5 to FBS", () => {
  assert.equal(tierToCollegeDivision("FBS_POWER_4"), "FBS");
  assert.equal(tierToCollegeDivision("FBS_GROUP_OF_5"), "FBS");
  assert.equal(tierToCollegeDivision("D2"), "DII");
});

check("directory card never invents recruiting contacts", () => {
  const card = mapDatabaseSchoolToDirectoryCard(sampleSchool);
  assert.equal(card.id, "cfbd-251");
  assert.equal(card.division, "FBS");
  assert.equal(card.recruitingEmail, null);
  assert.equal(card.recruitingPhone, null);
  assert.match(card.cityState, /Austin/);
});

check("gateway card forces null contacts and HC fallback", () => {
  const card = mapDatabaseSchoolToGatewayCard(sampleSchool, null);
  assert.equal(card.divisionTier, "FBS_P4");
  assert.equal(card.primaryRecruitingEmail, null);
  assert.equal(card.coachingPhone, null);
  assert.equal(card.headCoach, "Contact not verified");
  const withHc = mapDatabaseSchoolToGatewayCard(sampleSchool, "Steve Sarkisian");
  assert.equal(withHc.headCoach, "Steve Sarkisian");
});

check("coach profile preserves null email/phone", () => {
  const joined: DirectoryCoachJoined = {
    coachId: "11111111-1111-1111-1111-111111111111",
    schoolId: "cfbd-251",
    fullName: "Example Coach",
    title: "Wide Receivers Coach",
    email: null,
    officePhone: null,
    twitterHandle: null,
    sourceUrl: "https://example.edu/staff",
    lastVerifiedAt: "2026-09-01T00:00:00.000Z",
    institutionName: "University of Texas",
    conference: "SEC",
    tier: "FBS_POWER_4",
    city: "Austin",
    state: "TX",
  };
  const profile = mapDirectoryCoachToProfile(joined);
  assert.equal(profile.email, null);
  assert.equal(profile.phone, null);
  assert.equal(profile.division, "FBS");
  assert.equal(profile.school, "University of Texas");
});

if (failures > 0) {
  console.error(`\nDirectory mapper suite: ${failures} failure(s)`);
  process.exit(1);
}

console.log("\nDirectory mapper suite: all checks passed");

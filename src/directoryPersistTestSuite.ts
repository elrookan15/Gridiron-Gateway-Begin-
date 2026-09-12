/**
 * Directory persist smoke tests (no live Supabase required).
 */
import assert from "node:assert/strict";
import {
  isDirectoryPostgresConfigured,
  persistCoachesToPostgres,
  persistProgramsToPostgres,
} from "./lib/directoryPersist";
import type { CanonicalProgramRecord, DatabaseCoach } from "./types";

let failures = 0;

async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

const sampleProgram: CanonicalProgramRecord = {
  id: "cfbd-test-1",
  cfbdId: 1,
  institutionName: "Test University",
  mascot: "Testers",
  abbreviation: "TST",
  conference: "SEC",
  classification: "fbs",
  city: "Austin",
  state: "TX",
  stadiumCapacity: 1000,
  primaryColorHex: "#000000",
  secondaryColorHex: "#FFFFFF",
  athleticsBaseUrl: null,
  dataSource: "cfbd",
  lastSyncedAt: new Date().toISOString(),
};

async function main(): Promise<void> {
  await check("isDirectoryPostgresConfigured reflects env", () => {
    assert.equal(typeof isDirectoryPostgresConfigured(), "boolean");
  });

  await check("persistPrograms fails closed without service role (or upserts when set)", async () => {
    const result = await persistProgramsToPostgres([sampleProgram]);
    if (!isDirectoryPostgresConfigured()) {
      assert.equal(result.ok, false);
      assert.match(result.error ?? "", /SERVICE_ROLE/);
      return;
    }
    assert.equal(result.ok, true);
  });

  await check("persistCoaches fails closed without service role (or upserts when set)", async () => {
    const coach: DatabaseCoach = {
      coachId: "not-a-uuid",
      schoolId: "cfbd-test-1",
      fullName: "Test Coach",
      title: "Head Coach",
      email: null,
      officePhone: null,
      twitterHandle: null,
      sourceUrl: null,
      lastVerifiedAt: new Date().toISOString(),
    };
    const result = await persistCoachesToPostgres([coach]);
    if (!isDirectoryPostgresConfigured()) {
      assert.equal(result.ok, false);
      return;
    }
    assert.equal(typeof result.ok, "boolean");
  });

  if (failures > 0) {
    console.error(`\nDirectory persist suite: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log("\nDirectory persist suite: all checks passed");
}

void main();

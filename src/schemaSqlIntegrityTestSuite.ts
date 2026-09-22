/**
 * Static integrity checks for schema.sql schools DDL (no live Postgres required).
 * Guards against reintroducing a second `CREATE TABLE schools` that collides with
 * production `schools(school_id VARCHAR)`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function runSchemaSqlIntegrityTestSuite(): void {
  console.log("==================================================");
  console.log("SCHEMA.SQL SCHOOLS DDL INTEGRITY GATE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string): void {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed += 1;
    } else {
      console.error(`  FAIL: ${name}${detail ? ` -> ${detail}` : ""}`);
      failed += 1;
    }
  }

  const schemaSql = fs.readFileSync(path.join(root, "schema.sql"), "utf8");
  const productionSql = fs.readFileSync(path.join(root, "schema.production.sql"), "utf8");

  // Match CREATE TABLE [IF NOT EXISTS] schools (not schools_mvp_archive)
  const createSchools = [
    ...schemaSql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(schools)\s*\(/gi),
  ];
  assert(
    createSchools.length === 1,
    "schema.sql defines CREATE TABLE schools exactly once",
    `found ${createSchools.length}`,
  );

  assert(
    /CREATE\s+TABLE\s+schools_mvp_archive\s*\(/i.test(schemaSql),
    "schema.sql defines schools_mvp_archive for legacy UUID MVP",
  );

  assert(
    /REFERENCES\s+schools_mvp_archive\s*\(\s*id\s*\)/i.test(schemaSql),
    "scholarship_offers (or peers) FK to schools_mvp_archive(id)",
  );

  assert(
    !/REFERENCES\s+schools\s*\(\s*id\s*\)/i.test(schemaSql),
    "No FK references schools(id) — production PK is school_id",
  );

  assert(
    /school_id\s+VARCHAR\s*\(\s*100\s*\)\s+PRIMARY\s+KEY/i.test(schemaSql),
    "Production schools PK is VARCHAR school_id",
  );

  assert(
    /school_id\s+VARCHAR\s*\(\s*100\s*\)\s+PRIMARY\s+KEY/i.test(productionSql),
    "schema.production.sql PK is VARCHAR school_id",
  );

  // No second college_coaches CREATE (TEXT id mirror removed)
  const createCoaches = [
    ...schemaSql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?college_coaches\s*\(/gi),
  ];
  assert(
    createCoaches.length === 1,
    "schema.sql defines CREATE TABLE college_coaches exactly once (production UUID)",
    `found ${createCoaches.length}`,
  );

  // Scouting athlete_profiles (athlete_id) must not collide with dossier (user_id)
  const createAthletes = [
    ...schemaSql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?athlete_profiles\s*\(/gi),
  ];
  assert(
    createAthletes.length === 1,
    "schema.sql defines athlete_profiles exactly once (dossier user_id shape)",
    `found ${createAthletes.length}`,
  );

  assert(
    /CREATE\s+TABLE\s+athlete_profiles\s*\([\s\S]*?athlete_id\s+VARCHAR/i.test(productionSql),
    "schema.production.sql owns scouting athlete_profiles(athlete_id)",
  );

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runSchemaSqlIntegrityTestSuite();

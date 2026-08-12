/**
 * Monthly orchestration entrypoint for the program/coach ingestion pipeline.
 * Produces JSON artifacts under data/ingestion/output for Postgres upsert.
 */
import dotenv from "dotenv";
import type { IngestionRunSummary } from "../../src/types";
import { syncCfbdTeams } from "./cfbdTeamsSync";
import { importJucoPrepCsv } from "./jucoPrepCsvImport";
import { scrapeSidearmStaff } from "./sidearmStaffScraper";
import { writeJsonArtifact } from "./lib/io";
import path from "path";
import fs from "fs";

dotenv.config();

async function main() {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let programsUpserted = 0;
  let coachesUpserted = 0;
  let coachesMissingEmail = 0;

  try {
    const cfbdPrograms = await syncCfbdTeams();
    programsUpserted += cfbdPrograms.length;
  } catch (err) {
    errors.push(`CFBD: ${err instanceof Error ? err.message : String(err)}`);
  }

  const csvDefault = path.resolve(
    process.cwd(),
    "data/ingestion/templates/juco_prep_programs.template.csv"
  );
  if (fs.existsSync(csvDefault)) {
    try {
      const { programs, coaches } = importJucoPrepCsv(csvDefault);
      programsUpserted += programs.length;
      coachesUpserted += coaches.length;
      coachesMissingEmail += coaches.filter((c) => !c.email).length;
    } catch (err) {
      errors.push(`CSV: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const skipScrape = process.env.SKIP_SIDEARM_SCRAPE === "1";
  if (!skipScrape) {
    try {
      const coaches = await scrapeSidearmStaff();
      coachesUpserted += coaches.length;
      coachesMissingEmail += coaches.filter((c) => !c.email).length;
    } catch (err) {
      errors.push(`Sidearm: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    console.log("[Pipeline] SKIP_SIDEARM_SCRAPE=1 — scraper bypassed.");
  }

  const summary: IngestionRunSummary = {
    runId: `ingest-${Date.now()}`,
    startedAt,
    finishedAt: new Date().toISOString(),
    programsUpserted,
    coachesUpserted,
    coachesMissingEmail,
    errors,
  };

  const summaryPath = writeJsonArtifact("ingestion_run_summary.json", summary);
  console.log(`[Pipeline] Summary → ${summaryPath}`);
  console.log(JSON.stringify(summary, null, 2));

  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error("[Pipeline] Fatal:", err);
  process.exit(1);
});

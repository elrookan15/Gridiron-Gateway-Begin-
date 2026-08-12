/**
 * Monthly orchestration — CFBD → JUCO CSV → Sidearm (optional).
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import type { IngestionRunSummary } from "../../src/types";
import { runCfbdIngestionPipeline } from "../../src/cfbdIngestionPipeline";
import { runSidearmDirectoryScraper } from "../../src/sidearmDirectoryScraper";
import { parseSchoolsCsv } from "../../src/schoolsCsvImport";
import { writeJsonArtifact } from "../../src/ingestionUtils";

dotenv.config();

async function main() {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let programsUpserted = 0;
  let coachesUpserted = 0;
  let coachesMissingEmail = 0;

  try {
    const cfbd = await runCfbdIngestionPipeline();
    programsUpserted += cfbd.count;
  } catch (err) {
    errors.push(`CFBD: ${err instanceof Error ? err.message : String(err)}`);
  }

  const csvDefault = path.resolve(
    process.cwd(),
    "data/ingestion/templates/juco_prep_programs.template.csv"
  );
  if (fs.existsSync(csvDefault)) {
    try {
      const csv = parseSchoolsCsv(fs.readFileSync(csvDefault, "utf8"));
      programsUpserted += csv.programsUpserted;
      coachesUpserted += csv.coachesUpserted;
      coachesMissingEmail += csv.coaches.filter((c) => !c.email).length;
      errors.push(...csv.errors.map((e) => `CSV: ${e}`));
    } catch (err) {
      errors.push(`CSV: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (process.env.SKIP_SIDEARM_SCRAPE === "1") {
    console.log("[Pipeline] SKIP_SIDEARM_SCRAPE=1 — scraper bypassed.");
  } else {
    try {
      const sidearm = await runSidearmDirectoryScraper();
      coachesUpserted += sidearm.count;
      coachesMissingEmail += sidearm.missingEmailCount;
      errors.push(...sidearm.errors.map((e) => `Sidearm: ${e}`));
    } catch (err) {
      errors.push(`Sidearm: ${err instanceof Error ? err.message : String(err)}`);
    }
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

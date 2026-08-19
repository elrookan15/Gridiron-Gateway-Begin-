/**
 * CLI wrapper — delegates to src/sidearmDirectoryScraper.ts
 */
import { runSidearmDirectoryScraper } from "../../src/sidearmDirectoryScraper";

const seedArgIndex = process.argv.indexOf("--seed");
const seedArg = seedArgIndex >= 0 ? process.argv[seedArgIndex + 1] : undefined;

runSidearmDirectoryScraper({ seedPath: seedArg })
  .then((result) => {
    console.log(`[Sidearm] Wrote ${result.count} coach records → ${result.artifactPath}`);
    if (result.errors.length) {
      console.warn(`[Sidearm] ${result.errors.length} program errors`);
    }
  })
  .catch((err) => {
    console.error("[Sidearm] Scrape failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });

/**
 * CLI wrapper — delegates to src/cfbdIngestionPipeline.ts
 */
import { runCfbdIngestionPipeline } from "../../src/cfbdIngestionPipeline";

runCfbdIngestionPipeline()
  .then((result) => {
    console.log(`[CFBD] Synced ${result.count} programs → ${result.artifactPath}`);
  })
  .catch((err) => {
    console.error("[CFBD] Sync failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { DualPassResult } from "./types.ts";

/** Allowlisted npm script names only — blocks arbitrary shell from L2. */
const ALLOWED_NPM_SCRIPTS = new Set([
  "lint",
  "test:compliance",
  "test:rallysafe",
  "test:capgm",
  "test:parental-consent",
  "test:scouting",
  "test:laser",
  "test:gemini-school",
  "test:gcs-signed-url",
  "test:pre-commit",
  "test:federov-kernel",
]);

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Runtime Execution-Grounded Verification Engine.
 * Dual-pass Red (must fail) / Green (must pass) with mandatory restore of the target file.
 */
export class REGVEEngine {
  constructor(readonly repoRoot: string) {}

  runAllowlistedNpmScript(scriptName: string, timeoutMs = 120_000): CliResult {
    if (!ALLOWED_NPM_SCRIPTS.has(scriptName)) {
      return {
        exitCode: -1,
        stdout: "",
        stderr: `REFUSED: script "${scriptName}" is not in REGVE allowlist`,
      };
    }

    const result = spawnSync("npm", ["run", scriptName], {
      cwd: this.repoRoot,
      encoding: "utf8",
      timeout: timeoutMs,
      env: process.env,
    });

    if (result.error) {
      return { exitCode: -1, stdout: result.stdout ?? "", stderr: String(result.error) };
    }

    return {
      exitCode: result.status ?? -1,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    };
  }

  /**
   * Writes pre-patch (expect non-zero), then post-patch (expect zero), always restores original
   * when the target file existed before the call.
   */
  executeDualPassValidation(
    npmScriptName: string,
    prePatchCode: string,
    postPatchCode: string,
    targetFileRelative: string,
  ): DualPassResult {
    const filePath = path.resolve(this.repoRoot, targetFileRelative);
    const rootResolved = path.resolve(this.repoRoot);
    if (!filePath.startsWith(rootResolved + path.sep) && filePath !== rootResolved) {
      throw new Error(`Target path escapes repo root: ${targetFileRelative}`);
    }

    const hadFile = existsSync(filePath);
    const original = hadFile ? readFileSync(filePath, "utf8") : null;

    let redExitCode = -1;
    let greenExitCode = -1;
    let redStdout = "";
    let redStderr = "";
    let greenStdout = "";
    let greenStderr = "";
    let restored = false;

    try {
      writeFileSync(filePath, prePatchCode, "utf8");
      const red = this.runAllowlistedNpmScript(npmScriptName);
      redExitCode = red.exitCode;
      redStdout = red.stdout;
      redStderr = red.stderr;

      writeFileSync(filePath, postPatchCode, "utf8");
      const green = this.runAllowlistedNpmScript(npmScriptName);
      greenExitCode = green.exitCode;
      greenStdout = green.stdout;
      greenStderr = green.stderr;
    } finally {
      if (hadFile && original !== null) {
        writeFileSync(filePath, original, "utf8");
        restored = true;
      }
    }

    const verified = redExitCode !== 0 && greenExitCode === 0;
    return {
      verified,
      status: verified ? "Verified Execution State" : "Unverified Execution State",
      redExitCode,
      greenExitCode,
      redStdout,
      redStderr,
      greenStdout,
      greenStderr,
      restored,
    };
  }
}

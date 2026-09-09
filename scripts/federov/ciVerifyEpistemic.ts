/**
 * Prints Disproof Gate + epistemic risk summary for PR verification CI.
 * Exits non-zero when Re >= max risk (default 0.40).
 *
 * Env:
 *   FEDEROV_E_DIRECT, FEDEROV_E_EXECUTED, FEDEROV_U_ASSUMED, FEDEROV_U_RESIDUAL, FEDEROV_SEVERITY
 *   FEDEROV_MAX_EPISTEMIC_RISK (default 0.40)
 */
import {
  BayesianEpistemicEngine,
  EPISTEMIC_HALT_THRESHOLD,
} from "./bayesianEpistemic.ts";

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid numeric env ${name}=${raw}`);
  }
  return n;
}

const maxRisk = numEnv("FEDEROV_MAX_EPISTEMIC_RISK", EPISTEMIC_HALT_THRESHOLD);

const metrics = {
  eDirect: numEnv("FEDEROV_E_DIRECT", 1),
  eExecuted: numEnv("FEDEROV_E_EXECUTED", 1),
  uAssumed: numEnv("FEDEROV_U_ASSUMED", 0.25),
  uResidual: numEnv("FEDEROV_U_RESIDUAL", 0.25),
  severityImpact: Math.min(1, numEnv("FEDEROV_SEVERITY", 0.6)),
};

const result = BayesianEpistemicEngine.calculateRisk(metrics);

console.log("=== FEDEROV EPISTEMIC RISK ===");
console.log(JSON.stringify({ metrics, result, maxRisk }, null, 2));
console.log("");
console.log("DISPROOF GATE");
console.log("1. Failure Vector: Epistemic inputs are CI-supplied weights, not full formal proofs.");
console.log("2. Verified Evidence: npm run test:federov-kernel must pass in the same job.");
console.log("3. Unverified Boundaries: Third-party Jules marketplace actions are intentionally unused.");
console.log("4. User Decision Points: Raise FEDEROV_* evidence weights only with CLI traces attached.");

if (result.epistemicRiskScore >= maxRisk || result.haltExecutionFlag) {
  console.error(
    `\nHALT: Re=${result.epistemicRiskScore} >= max=${maxRisk} (rating=${result.riskRating})`,
  );
  process.exit(1);
}

console.log(`\nPASS: Re=${result.epistemicRiskScore} < max=${maxRisk}`);

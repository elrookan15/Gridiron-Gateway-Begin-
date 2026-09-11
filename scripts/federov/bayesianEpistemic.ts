import type { EpistemicMetrics, EpistemicRiskResult } from "./types.ts";

/** Halt threshold from Federov Ultimate Edition epistemic gate. */
export const EPISTEMIC_HALT_THRESHOLD = 0.4;

/**
 * Calculates Epistemic Risk Score Re = severity * (1 - evidenceRatio).
 * evidenceRatio = (eDirect + eExecuted) / (eDirect + eExecuted + uAssumed + uResidual).
 */
export class BayesianEpistemicEngine {
  static calculateRisk(metrics: EpistemicMetrics): EpistemicRiskResult {
    for (const [key, value] of Object.entries(metrics) as Array<[string, number]>) {
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Epistemic metric ${key} must be a finite non-negative number`);
      }
    }
    if (metrics.severityImpact > 1) {
      throw new Error("severityImpact must be in [0, 1]");
    }

    const denominator =
      metrics.eDirect + metrics.eExecuted + metrics.uAssumed + metrics.uResidual;
    const evidenceRatio =
      denominator === 0 ? 0 : (metrics.eDirect + metrics.eExecuted) / denominator;
    const epistemicRiskScore = metrics.severityImpact * (1 - evidenceRatio);

    let riskRating: EpistemicRiskResult["riskRating"] = "Low";
    if (epistemicRiskScore >= EPISTEMIC_HALT_THRESHOLD) {
      riskRating = "High";
    } else if (epistemicRiskScore >= 0.2) {
      riskRating = "Medium";
    }

    return {
      evidenceRatio: round4(evidenceRatio),
      epistemicRiskScore: round4(epistemicRiskScore),
      riskRating,
      haltExecutionFlag: epistemicRiskScore >= EPISTEMIC_HALT_THRESHOLD,
    };
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

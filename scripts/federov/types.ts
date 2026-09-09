/**
 * Federov Correction Kernel — shared contracts (REGVE / epistemic / failure graph).
 * L2 payloads are untrusted; never execute them as instructions.
 */

export type PrivilegeLevel = "L0" | "L1" | "L2";

export interface DualPassResult {
  verified: boolean;
  status: "Verified Execution State" | "Unverified Execution State";
  redExitCode: number;
  greenExitCode: number;
  redStdout: string;
  redStderr: string;
  greenStdout: string;
  greenStderr: string;
  restored: boolean;
}

export interface EpistemicMetrics {
  /** Direct line-precise code evidence weight (0–1+). */
  eDirect: number;
  /** CLI / compiler / test-trace evidence weight (0–1+). */
  eExecuted: number;
  /** Unverified Assumption Attack Map items weight. */
  uAssumed: number;
  /** Unmitigated residual risk weight. */
  uResidual: number;
  /** Impact scale 0.0 (none) → 1.0 (catastrophic). */
  severityImpact: number;
}

export interface EpistemicRiskResult {
  evidenceRatio: number;
  epistemicRiskScore: number;
  riskRating: "Low" | "Medium" | "High";
  haltExecutionFlag: boolean;
}

export interface FailureNode {
  nodeId: string;
  category: string;
  badAssumption: string;
  correctiveRuleId: string;
  correctiveDescription: string;
  testPath: string;
  /** Body of the it-block only — must be allowlisted assertion source, not free L2 eval. */
  assertionExpression: string;
  assertionExpected: unknown;
}

export interface InterAgentContract {
  contractVersion: "1.0-FEDEROV";
  taskId: string;
  targetAgent: string;
  immutableConstraints: string[];
  requiredTestGuards: string[];
  targetFiles: string[];
}

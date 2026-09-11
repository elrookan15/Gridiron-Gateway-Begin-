import type { InterAgentContract } from "./types.ts";

/**
 * Prevents semantic drift via 3-line checkpoints and immutable handoff JSON.
 */
export class ContextReAnchoringEngine {
  turnCount = 0;

  generateCheckpoint(
    turnNumber: number,
    activeMode: string,
    invariants: string[],
    ledgerRules: string[],
  ): string {
    this.turnCount = turnNumber;
    return [
      `=== STATE CHECKPOINT [Turn ${turnNumber}] ===`,
      `Active Mode: [${activeMode}]`,
      `Enforced Invariants: [${invariants.join(" | ")}]`,
      `Active Mistake Ledger Rules: [${ledgerRules.join(" | ")}]`,
      "==========================================",
    ].join("\n");
  }

  serializeInterAgentContract(
    taskId: string,
    targetAgent: string,
    specs: {
      constraints?: string[];
      tests?: string[];
      files?: string[];
    },
  ): string {
    const contract: InterAgentContract = {
      contractVersion: "1.0-FEDEROV",
      taskId,
      targetAgent,
      immutableConstraints: specs.constraints ?? [],
      requiredTestGuards: specs.tests ?? [],
      targetFiles: specs.files ?? [],
    };
    return `${JSON.stringify(contract, null, 2)}\n`;
  }
}

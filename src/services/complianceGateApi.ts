import type { ComplianceEvaluation, ComplianceGateDispatchRequest } from "../types";

const LEDGER_FAILURE: ComplianceEvaluation = {
  isCleared: false,
  status: "BLOCKED_AUDIT_LEDGER",
  flaggedKeywords: [],
  reason: "SYSTEM FAILURE: Unable to record mandatory compliance audit log.",
};

/**
 * SPA dispatch for NCAA messaging gates. Server re-evaluates and writes
 * `public.compliance_audit_logs` before returning clearance.
 */
export async function dispatchComplianceGate(
  request: ComplianceGateDispatchRequest,
): Promise<ComplianceEvaluation> {
  try {
    const response = await fetch("/api/v1/compliance/messaging-clearance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const payload = (await response.json()) as Partial<ComplianceEvaluation> & { error?: string };

    if (
      typeof payload.isCleared !== "boolean" ||
      typeof payload.status !== "string" ||
      typeof payload.reason !== "string"
    ) {
      return { ...LEDGER_FAILURE };
    }

    return {
      isCleared: payload.isCleared,
      status: payload.status,
      flaggedKeywords: Array.isArray(payload.flaggedKeywords) ? payload.flaggedKeywords : [],
      reason: payload.reason,
      auditLogId: payload.auditLogId,
    };
  } catch {
    return { ...LEDGER_FAILURE };
  }
}

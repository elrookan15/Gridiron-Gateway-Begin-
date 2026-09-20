import {
  EnrichedComplianceBatchSchema,
  SessionContextSchema,
  type EnrichedComplianceBatch,
} from "./sessionEnvelope";
import { evaluatePeriodGate, type PeriodGateVerdict } from "./periodGate";

export type FindingCode =
  | "TEMPORAL_CONTEXT_INVALID"
  | "BOOSTER"
  | "NON_COACHING_STAFF"
  | "CALENDAR_NULL"
  | "EXPENSE_BENEFICIARY"
  | "PERIOD_GATE"
  | "SLICE_NOT_IMPLEMENTED";

export interface ComplianceFinding {
  code: FindingCode;
  severity: "FLAG" | "VIOLATION";
  event_id?: string;
  prospect_id?: string;
  detail: string;
  period_gate?: PeriodGateVerdict;
}

export interface AuditOptions {
  expenseBeneficiary?: string | null;
  expense_beneficiary?: string | null;
  staffTimezone?: string;
}

export interface AuditResult {
  status: "CLEAR" | "FLAGGED" | "VIOLATION";
  findings: ComplianceFinding[];
  batch: EnrichedComplianceBatch | null;
}

function statusFor(findings: ComplianceFinding[]): AuditResult["status"] {
  if (findings.some((finding) => finding.severity === "VIOLATION")) return "VIOLATION";
  if (findings.length > 0) return "FLAGGED";
  return "CLEAR";
}

/** Outer guard/harness. It intentionally does not implement deferred slices. */
export function auditComplianceBatch(input: unknown, options: AuditOptions = {}): AuditResult {
  const parsed = EnrichedComplianceBatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "FLAGGED",
      findings: [{ code: "TEMPORAL_CONTEXT_INVALID", severity: "FLAG", detail: "Enriched compliance batch failed schema validation." }],
      batch: null,
    };
  }
  const batch = parsed.data;
  const context = SessionContextSchema.safeParse(batch.session);
  if (!context.success) {
    return {
      status: "FLAGGED",
      findings: [{ code: "TEMPORAL_CONTEXT_INVALID", severity: "FLAG", detail: "Session temporal context is invalid." }],
      batch,
    };
  }
  const findings: ComplianceFinding[] = [];
  for (const event of batch.events) {
    const eventRecord = event as Record<string, unknown>;
    const eventRole = eventRecord.staff_role;
    if (eventRecord.booster === true || eventRecord.booster_involved === true || eventRole === "BOOSTER") {
      findings.push({ code: "BOOSTER", severity: "FLAG", event_id: event.event_id, detail: "Booster involvement requires a separate compliance review." });
    }
    if (eventRecord.expense_beneficiary || options.expenseBeneficiary || options.expense_beneficiary) {
      findings.push({ code: "EXPENSE_BENEFICIARY", severity: "FLAG", event_id: event.event_id, detail: "Expense beneficiary slice is flagged for review." });
    }
    if (event.calendar === null) {
      findings.push({ code: "CALENDAR_NULL", severity: "FLAG", event_id: event.event_id, detail: "No calendar was resolved for this event." });
    }
    for (const prospect of event.prospects) {
      if (prospect.status === "HALT") continue;
      if (prospect.evaluation_initiator === "NON_COACHING_STAFF") {
        findings.push({ code: "NON_COACHING_STAFF", severity: "FLAG", event_id: event.event_id, prospect_id: prospect.prospect_id, detail: "Evaluation attributed to non-coaching staff." });
      }
    }
    if (event.interaction_mode === "IN_PERSON_ON_CAMPUS" || event.interaction_mode === "IN_PERSON_OFF_CAMPUS" || event.interaction_mode === "EVALUATION") {
      findings.push({ code: "SLICE_NOT_IMPLEMENTED", severity: "FLAG", event_id: event.event_id, detail: "In-person/evaluation ledger slice is deferred in ASP v1.0." });
    }
    if (batch.session.sport === "FOOTBALL" && batch.session.division === "FBS") {
      const gate = evaluatePeriodGate({
        occurredAt: event.occurred_at,
        sport: batch.session.sport,
        division: batch.session.division,
        staffTimezone: options.staffTimezone ?? batch.session.staff_timezone,
        interactionMode: event.interaction_mode,
        direction: (eventRecord.direction as "OUTBOUND" | "INBOUND" | "UNKNOWN" | undefined) ?? "UNKNOWN",
      });
      if (gate.status !== "PERMISSIBLE") {
        findings.push({ code: "PERIOD_GATE", severity: gate.status === "VIOLATION" ? "VIOLATION" : "FLAG", event_id: event.event_id, detail: gate.reason, period_gate: gate });
      }
    }
  }
  return { status: statusFor(findings), findings, batch };
}

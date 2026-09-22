import {
  EnrichedComplianceBatchSchema,
  SessionContextSchema,
  type EnrichedComplianceBatch,
} from "./sessionEnvelope";
import { evaluatePeriodGate, type PeriodGateVerdict } from "./periodGate";

export type FindingCode =
  | "TEMPORAL_CONTEXT_INVALID"
  | "EXTRACTOR_HALT"
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

function isImplementedPeriodGateSlice(sport: string, division: string): boolean {
  return sport === "FOOTBALL" && division === "FBS";
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
  const sessionImplemented = isImplementedPeriodGateSlice(batch.session.sport, batch.session.division);
  if (!sessionImplemented) {
    findings.push({
      code: "SLICE_NOT_IMPLEMENTED",
      severity: "FLAG",
      detail: `PeriodGate slice is unimplemented for ${batch.session.sport}/${batch.session.division}; ASP v1.0 audits FOOTBALL/FBS only.`,
    });
  }

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

    let readyCount = 0;
    for (const prospect of event.prospects) {
      if (prospect.status === "HALT") {
        findings.push({
          code: "EXTRACTOR_HALT",
          severity: "FLAG",
          event_id: event.event_id,
          prospect_id: prospect.prospect_id,
          detail: `Extractor halted prospect: ${prospect.reason}`,
        });
        continue;
      }
      readyCount += 1;
      if (prospect.evaluation_initiator === "NON_COACHING_STAFF") {
        findings.push({ code: "NON_COACHING_STAFF", severity: "FLAG", event_id: event.event_id, prospect_id: prospect.prospect_id, detail: "Evaluation attributed to non-coaching staff." });
      }
    }
    if (readyCount === 0) {
      findings.push({
        code: "EXTRACTOR_HALT",
        severity: "FLAG",
        event_id: event.event_id,
        detail: "Event has no READY prospects; quarantined fail-closed.",
      });
    }

    if (event.interaction_mode === "IN_PERSON_ON_CAMPUS" || event.interaction_mode === "IN_PERSON_OFF_CAMPUS" || event.interaction_mode === "EVALUATION") {
      findings.push({ code: "SLICE_NOT_IMPLEMENTED", severity: "FLAG", event_id: event.event_id, detail: "In-person/evaluation ledger slice is deferred in ASP v1.0." });
    }

    if (!sessionImplemented) {
      continue;
    }

    const staffTimezone = options.staffTimezone ?? batch.session.staff_timezone;
    if (!staffTimezone || staffTimezone.trim().length === 0) {
      findings.push({
        code: "TEMPORAL_CONTEXT_INVALID",
        severity: "FLAG",
        event_id: event.event_id,
        detail: "staffTimezone is missing; refuse UTC default.",
      });
      continue;
    }

    const gate = evaluatePeriodGate({
      occurredAt: event.occurred_at,
      sport: batch.session.sport,
      division: batch.session.division,
      staffTimezone,
      interactionMode: event.interaction_mode,
      direction: (eventRecord.direction as "OUTBOUND" | "INBOUND" | "UNKNOWN" | undefined) ?? "UNKNOWN",
    });
    if (gate.status !== "PERMISSIBLE") {
      findings.push({
        code: gate.fallback === "RULE_TABLE_MISS" && gate.reason.includes("timezone")
          ? "TEMPORAL_CONTEXT_INVALID"
          : "PERIOD_GATE",
        severity: gate.status === "VIOLATION" ? "VIOLATION" : "FLAG",
        event_id: event.event_id,
        detail: gate.reason,
        period_gate: gate,
      });
    }
  }
  return { status: statusFor(findings), findings, batch };
}

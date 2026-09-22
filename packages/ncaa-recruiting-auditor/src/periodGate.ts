import type { InteractionMode } from "./sessionEnvelope";

export type GateStatus = "PERMISSIBLE" | "VIOLATION" | "FLAGGED";
export type SigningStatusScope = "ANY" | "UNSIGNED_ONLY" | "SIGNED_ONLY" | "VERBAL_COMMITMENT_ONLY";
export type CohortBarrier = "NONE" | "SIGNING_STATUS" | "SIGNING_DATE";
export type ContactDirection = "OUTBOUND" | "INBOUND" | "UNKNOWN";

export interface RuleTableRow {
  id: string;
  sport: "FOOTBALL";
  division: "FBS";
  local_start: string;
  local_end_exclusive: string;
  period: "QUIET_PERIOD" | "DEAD_PERIOD";
  interaction_mode: InteractionMode | "ANY";
  direction: ContactDirection | "ANY";
  signing_scope: SigningStatusScope;
  cohort_barrier: CohortBarrier;
  status: GateStatus;
  rationale: string;
}

/**
 * Frozen ASP D1_FBS_FOOTBALL table. Boundaries are local calendar boundaries;
 * local_end_exclusive is deliberately exclusive so a zone conversion cannot
 * create a phantom extra minute.
 */
export const D1_FBS_FOOTBALL_RULES: readonly RuleTableRow[] = [
  {
    id: "FBS-2026-07-01-07-25-ELECTRONIC",
    sport: "FOOTBALL", division: "FBS", local_start: "07-01T00:00", local_end_exclusive: "07-25T00:00",
    period: "QUIET_PERIOD", interaction_mode: "ELECTRONIC", direction: "ANY", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "PERMISSIBLE", rationale: "Electronic recruiting communication is permissible in the frozen July quiet-period slice.",
  },
  {
    id: "FBS-2026-07-01-07-25-PHONE-OUTBOUND",
    sport: "FOOTBALL", division: "FBS", local_start: "07-01T00:00", local_end_exclusive: "07-25T00:00",
    period: "QUIET_PERIOD", interaction_mode: "PHONE", direction: "OUTBOUND", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "VIOLATION", rationale: "An outbound phone call is not permissible in this frozen quiet-period slice.",
  },
  {
    id: "FBS-2026-07-01-07-25-PHONE-INBOUND",
    sport: "FOOTBALL", division: "FBS", local_start: "07-01T00:00", local_end_exclusive: "07-25T00:00",
    period: "QUIET_PERIOD", interaction_mode: "PHONE", direction: "INBOUND", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "PERMISSIBLE", rationale: "A prospect-initiated inbound phone call is permissible in the frozen slice.",
  },
  {
    id: "FBS-2026-07-01-07-25-IN-PERSON-ON-CAMPUS",
    sport: "FOOTBALL", division: "FBS", local_start: "07-01T00:00", local_end_exclusive: "07-25T00:00",
    period: "QUIET_PERIOD", interaction_mode: "IN_PERSON_ON_CAMPUS", direction: "ANY", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "VIOLATION", rationale: "The frozen ASP period gate does not permit this on-campus contact in the slice.",
  },
  {
    id: "FBS-2026-07-01-07-25-IN-PERSON-OFF-CAMPUS",
    sport: "FOOTBALL", division: "FBS", local_start: "07-01T00:00", local_end_exclusive: "07-25T00:00",
    period: "QUIET_PERIOD", interaction_mode: "IN_PERSON_OFF_CAMPUS", direction: "ANY", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "VIOLATION", rationale: "The frozen ASP period gate does not permit this off-campus contact in the slice.",
  },
  {
    id: "FBS-2026-07-01-07-25-EVALUATION",
    sport: "FOOTBALL", division: "FBS", local_start: "07-01T00:00", local_end_exclusive: "07-25T00:00",
    period: "QUIET_PERIOD", interaction_mode: "EVALUATION", direction: "ANY", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "FLAGGED", rationale: "Evaluation is routed to the deferred evaluation slice rather than inferred here.",
  },
  {
    id: "FBS-2026-07-25-08-01-DEAD-PERIOD",
    sport: "FOOTBALL", division: "FBS", local_start: "07-25T00:00", local_end_exclusive: "08-01T00:00",
    period: "DEAD_PERIOD", interaction_mode: "ANY", direction: "ANY", signing_scope: "ANY", cohort_barrier: "NONE",
    status: "VIOLATION", rationale: "No recruiting interaction mode in the frozen table is permissible during this dead-period row.",
  },
];

export interface EvaluationInput {
  occurredAt?: string | Date;
  occurred_at?: string;
  sport?: string;
  division?: string;
  staffTimezone?: string;
  staff_timezone?: string;
  interactionMode?: InteractionMode;
  interaction_mode?: InteractionMode;
  direction?: ContactDirection;
  initiator?: "INITIATOR" | "PASSIVE" | "UNKNOWN";
  signingStatus?: "UNSIGNED" | "VERBAL_COMMITMENT" | "SIGNED" | "ENROLLED";
  signing_status?: "UNSIGNED" | "VERBAL_COMMITMENT" | "SIGNED" | "ENROLLED";
  cohortBarrier?: CohortBarrier;
  cohort_barrier?: CohortBarrier;
}

export interface PeriodGateVerdict {
  status: GateStatus;
  rule_id: string | null;
  reason: string;
  local_time: string | null;
  fallback?: "RULE_TABLE_MISS";
}

function canonicalInput(input: EvaluationInput) {
  const direction = input.direction ?? (input.initiator === "INITIATOR" ? "OUTBOUND" : input.initiator === "PASSIVE" ? "INBOUND" : "UNKNOWN");
  const staffTimezone = input.staffTimezone ?? input.staff_timezone;
  return {
    ...input,
    occurredAt: input.occurredAt ?? input.occurred_at,
    sport: input.sport,
    division: input.division,
    // Never invent UTC — missing tz must fail closed before localParts.
    staffTimezone: typeof staffTimezone === "string" && staffTimezone.trim().length > 0 ? staffTimezone : undefined,
    interactionMode: input.interactionMode ?? input.interaction_mode,
    direction,
    signingStatus: input.signingStatus ?? input.signing_status ?? "UNSIGNED",
    cohortBarrier: input.cohortBarrier ?? input.cohort_barrier ?? "NONE",
  };
}

function localParts(value: string | Date, timeZone: string): { monthDay: string; local: string } | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(date).reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return { monthDay: `${parts.month}-${parts.day}`, local: `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` };
  } catch {
    return null;
  }
}

function inLocalWindow(local: string, start: string, end: string): boolean {
  const time = local.slice(5, 16);
  return time >= start && time < end;
}

export function isCohortBarrierSatisfied(row: RuleTableRow, input: EvaluationInput): boolean {
  const value = canonicalInput(input);
  if (row.cohort_barrier === "NONE") return true;
  if (row.signing_scope === "ANY") return true;
  const status = value.signingStatus;
  if (row.signing_scope === "UNSIGNED_ONLY") return status === "UNSIGNED" || status === "VERBAL_COMMITMENT";
  if (row.signing_scope === "SIGNED_ONLY") return status === "SIGNED" || status === "ENROLLED";
  if (row.signing_scope === "VERBAL_COMMITMENT_ONLY") return status === "VERBAL_COMMITMENT";
  return false;
}

export function matchesSigningScope(row: RuleTableRow, input: EvaluationInput): boolean {
  const value = canonicalInput(input);
  if (row.signing_scope === "ANY") return true;
  if (row.signing_scope === "UNSIGNED_ONLY") return value.signingStatus === "UNSIGNED" || value.signingStatus === "VERBAL_COMMITMENT";
  if (row.signing_scope === "SIGNED_ONLY") return value.signingStatus === "SIGNED" || value.signingStatus === "ENROLLED";
  return value.signingStatus === "VERBAL_COMMITMENT";
}

export function evaluatePeriodGate(input: EvaluationInput): PeriodGateVerdict {
  const value = canonicalInput(input);
  const timeZone = value.staffTimezone;
  const occurredAt = value.occurredAt;
  if (!occurredAt || !value.interactionMode) {
    return { status: "FLAGGED", rule_id: null, reason: "RULE_TABLE_MISS: missing temporal or interaction fields", local_time: null, fallback: "RULE_TABLE_MISS" };
  }
  if (!timeZone) {
    return { status: "FLAGGED", rule_id: null, reason: "RULE_TABLE_MISS: missing staff timezone", local_time: null, fallback: "RULE_TABLE_MISS" };
  }
  const local = localParts(occurredAt, timeZone);
  if (!local) {
    return { status: "FLAGGED", rule_id: null, reason: "RULE_TABLE_MISS: invalid timestamp or staff timezone", local_time: null, fallback: "RULE_TABLE_MISS" };
  }
  // Frozen table rows are year-scoped (ids FBS-2026-…); month-day matching alone
  // would apply 2026 quiet/dead windows to other years — refuse with RULE_TABLE_MISS.
  const localYear = local.local.slice(0, 4);
  if (localYear !== "2026") {
    return {
      status: "FLAGGED",
      rule_id: null,
      reason: "RULE_TABLE_MISS: frozen D1_FBS_FOOTBALL_2026 table has no row for this local year",
      local_time: local.local,
      fallback: "RULE_TABLE_MISS",
    };
  }
  const candidates = D1_FBS_FOOTBALL_RULES.filter((row) =>
    value.sport === row.sport && value.division === row.division &&
    inLocalWindow(local.local, row.local_start, row.local_end_exclusive) &&
    (row.interaction_mode === "ANY" || row.interaction_mode === value.interactionMode) &&
    (row.direction === "ANY" || row.direction === value.direction) &&
    matchesSigningScope(row, value) && isCohortBarrierSatisfied(row, value));
  if (candidates.length === 0) {
    return { status: "FLAGGED", rule_id: null, reason: "RULE_TABLE_MISS: no frozen row matched", local_time: local.local, fallback: "RULE_TABLE_MISS" };
  }
  const row = candidates[0];
  return { status: row.status, rule_id: row.id, reason: row.rationale, local_time: local.local };
}

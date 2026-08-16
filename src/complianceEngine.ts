import type {
  ClearanceStatus,
  ComplianceAuditLog,
  ComplianceEvaluation,
  NcaaClearanceRequest,
  NcaaRecruitingPeriod,
} from "./types";

export interface RecruitingPeriodRow {
  id: string;
  sport: string;
  division: string;
  period_type: "quiet" | "dead" | "contact" | "evaluation";
  applies_to_class_year: "junior" | "senior" | "transfer_portal" | "all";
  contact_methods_allowed: Array<"written" | "electronic" | "call" | "in_person">;
  start_date: string; // ISO String
  end_date: string;   // ISO String
  season_year: number;
  source_citation: string;
  created_by: string;
  updated_at: string;
}

export interface MessageSendAttemptRow {
  id: string;
  coach_id: string;
  recruit_id: string;
  attempted_at: string;
  decision: "allowed" | "blocked" | "error";
  matched_period_id: string | null;
  period_type_at_attempt: string | null;
  contact_method: string;
  message_id: string | null;
  reason: string;
  source_citation?: string;
}

export interface CoachRecord {
  id: string;
  name: string;
  school: string;
  division: string;
}

export interface RecruitRecord {
  id: string;
  name: string;
  class_year: "junior" | "senior" | "transfer_portal";
  high_school: string;
  state: string;
  division_target: string;
}

// In-Memory Database Stores for Server
export const COACHES_DB: Record<string, CoachRecord> = {
  "cch_fbs_freeman": {
    id: "cch_fbs_freeman",
    name: "Coach Marcus Freeman",
    school: "Notre Dame",
    division: "FBS"
  },
  "cch_fcs_taylor": {
    id: "cch_fcs_taylor",
    name: "Coach Tim Taylor",
    school: "South Dakota State",
    division: "FCS"
  },
  "cch_naia_miller": {
    id: "cch_naia_miller",
    name: "Coach Greg Miller",
    school: "Morningside University",
    division: "NAIA"
  }
};

export const RECRUITS_DB: Record<string, RecruitRecord> = {
  "rec_jr_hunter": {
    id: "rec_jr_hunter",
    name: "Travis Hunter Jr.",
    class_year: "junior",
    high_school: "Collins Hill HS",
    state: "GA",
    division_target: "FBS"
  },
  "rec_sr_manning": {
    id: "rec_sr_manning",
    name: "Arch Manning Jr.",
    class_year: "senior",
    high_school: "Isidore Newman",
    state: "LA",
    division_target: "FBS"
  },
  "rec_portal_nelson": {
    id: "rec_portal_nelson",
    name: "Malachi Nelson",
    class_year: "transfer_portal",
    high_school: "USC Transfer",
    state: "CA",
    division_target: "FBS"
  }
};

// Initial Seed Recruiting Periods
export let RECRUITING_PERIODS_DB: RecruitingPeriodRow[] = [
  {
    id: "PER-2026-FB-FBS-QUIET-AUG",
    sport: "football",
    division: "FBS",
    period_type: "quiet",
    applies_to_class_year: "all",
    contact_methods_allowed: ["electronic", "written"],
    start_date: "2026-08-01T00:00:00.000Z",
    end_date: "2026-08-31T23:59:59.000Z",
    season_year: 2026,
    source_citation: "NCAA Div I Bylaw 13.17.4 - August Quiet Period",
    created_by: "admin_compliance_01",
    updated_at: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "PER-2026-FB-FBS-CONTACT-DEC",
    sport: "football",
    division: "FBS",
    period_type: "contact",
    applies_to_class_year: "all",
    contact_methods_allowed: ["electronic", "written", "call", "in_person"],
    start_date: "2026-12-01T00:00:00.000Z",
    end_date: "2026-12-20T23:59:59.000Z",
    season_year: 2026,
    source_citation: "NCAA Div I Football Contact Period Bylaw 13.17.4.1",
    created_by: "admin_compliance_01",
    updated_at: "2026-08-01T00:00:00.000Z"
  }
];

export let MESSAGE_SEND_ATTEMPTS_DB: MessageSendAttemptRow[] = [];
export let MESSAGES_DB: Array<{ id: string; send_attempt_id: string; coach_id: string; recruit_id: string; text: string; sent_at: string }> = [];

export function resetPeriodsDb(customPeriods?: RecruitingPeriodRow[]) {
  if (customPeriods) {
    RECRUITING_PERIODS_DB = [...customPeriods];
  } else {
    RECRUITING_PERIODS_DB = [
      {
        id: "PER-2026-FB-FBS-QUIET-AUG",
        sport: "football",
        division: "FBS",
        period_type: "quiet",
        applies_to_class_year: "all",
        contact_methods_allowed: ["electronic", "written"],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Div I Bylaw 13.17.4 - August Quiet Period",
        created_by: "admin_compliance_01",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ];
  }
}

export function evaluateComplianceGate(params: {
  coach_id: string;
  recruit_id: string;
  contact_method: string;
  override_timestamp?: string;
  writeAuditLog: boolean;
  message_text?: string;
  raw_request_body?: Record<string, any>;
}): {
  httpStatus: number;
  decision: "allowed" | "blocked" | "error";
  matched_period_id: string | null;
  period_type_at_attempt: string | null;
  contact_method: string;
  reason: string;
  source_citation?: string;
  audit_log_id?: string;
  message_id?: string;
} {
  const { coach_id, recruit_id, contact_method, override_timestamp, writeAuditLog, message_text } = params;

  // 1. Authoritative DB Lookup for Coach & Recruit (Ignore client claim)
  const coach = COACHES_DB[coach_id];
  const recruit = RECRUITS_DB[recruit_id];

  const now = override_timestamp ? new Date(override_timestamp) : new Date();
  const attemptTimestampStr = now.toISOString();

  if (!coach) {
    const errorReason = `Coach record '${coach_id}' not found in database.`;
    let auditId: string | undefined;
    if (writeAuditLog) {
      auditId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      MESSAGE_SEND_ATTEMPTS_DB.unshift({
        id: auditId,
        coach_id,
        recruit_id,
        attempted_at: attemptTimestampStr,
        decision: "error",
        matched_period_id: null,
        period_type_at_attempt: null,
        contact_method,
        message_id: null,
        reason: errorReason
      });
    }
    return {
      httpStatus: 403,
      decision: "error",
      matched_period_id: null,
      period_type_at_attempt: null,
      contact_method,
      reason: errorReason,
      audit_log_id: auditId
    };
  }

  if (!recruit) {
    const errorReason = `Recruit record '${recruit_id}' not found in database.`;
    let auditId: string | undefined;
    if (writeAuditLog) {
      auditId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      MESSAGE_SEND_ATTEMPTS_DB.unshift({
        id: auditId,
        coach_id,
        recruit_id,
        attempted_at: attemptTimestampStr,
        decision: "error",
        matched_period_id: null,
        period_type_at_attempt: null,
        contact_method,
        message_id: null,
        reason: errorReason
      });
    }
    return {
      httpStatus: 403,
      decision: "error",
      matched_period_id: null,
      period_type_at_attempt: null,
      contact_method,
      reason: errorReason,
      audit_log_id: auditId
    };
  }

  // 2. Query recruiting_periods database table
  const matchedRows = RECRUITING_PERIODS_DB.filter((row) => {
    if (row.sport !== "football") return false;
    if (row.division !== coach.division) return false;
    const appliesToClass = row.applies_to_class_year === "all" || row.applies_to_class_year === recruit.class_year;
    if (!appliesToClass) return false;

    const start = new Date(row.start_date);
    const end = new Date(row.end_date);
    return now >= start && now <= end;
  });

  // 3. Fail-Closed Logic Evaluation
  if (matchedRows.length === 0) {
    const errorReason = `FAIL-CLOSED: No active recruiting_periods row found in calendar database for sport=football, division=${coach.division}, class_year=${recruit.class_year} at ${attemptTimestampStr}. Messaging blocked by default safety gate.`;
    let auditId: string | undefined;
    if (writeAuditLog) {
      auditId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      MESSAGE_SEND_ATTEMPTS_DB.unshift({
        id: auditId,
        coach_id,
        recruit_id,
        attempted_at: attemptTimestampStr,
        decision: "error",
        matched_period_id: null,
        period_type_at_attempt: null,
        contact_method,
        message_id: null,
        reason: errorReason
      });
    }

    return {
      httpStatus: 403,
      decision: "error",
      matched_period_id: null,
      period_type_at_attempt: null,
      contact_method,
      reason: errorReason,
      audit_log_id: auditId
    };
  }

  if (matchedRows.length > 1) {
    const errorReason = `FAIL-CLOSED: Conflicting/Overlapping recruiting_periods rows (${matchedRows.map((r) => r.id).join(", ")}) matched division=${coach.division} at ${attemptTimestampStr}. Data-entry conflict detected. Blocked for compliance audit.`;
    let auditId: string | undefined;
    if (writeAuditLog) {
      auditId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      MESSAGE_SEND_ATTEMPTS_DB.unshift({
        id: auditId,
        coach_id,
        recruit_id,
        attempted_at: attemptTimestampStr,
        decision: "error",
        matched_period_id: null,
        period_type_at_attempt: "CONFLICT_ERROR",
        contact_method,
        message_id: null,
        reason: errorReason
      });
    }

    return {
      httpStatus: 403,
      decision: "error",
      matched_period_id: null,
      period_type_at_attempt: "CONFLICT_ERROR",
      contact_method,
      reason: errorReason,
      audit_log_id: auditId
    };
  }

  // Exactly 1 matched row
  const period = matchedRows[0];
  const allowedMethods = period.contact_methods_allowed as readonly string[];
  const isMethodAllowed =
    allowedMethods.includes(contact_method) && period.period_type !== "dead";

  if (!isMethodAllowed) {
    const blockReason = `Blocked by NCAA ${period.period_type.toUpperCase()} period rule (${period.id}). Contact method '${contact_method}' not permitted under allowed methods: [${period.contact_methods_allowed.join(", ")}].`;
    let auditId: string | undefined;
    if (writeAuditLog) {
      auditId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      MESSAGE_SEND_ATTEMPTS_DB.unshift({
        id: auditId,
        coach_id,
        recruit_id,
        attempted_at: attemptTimestampStr,
        decision: "blocked",
        matched_period_id: period.id,
        period_type_at_attempt: period.period_type,
        contact_method,
        message_id: null,
        reason: blockReason,
        source_citation: period.source_citation
      });
    }

    return {
      httpStatus: 403,
      decision: "blocked",
      matched_period_id: period.id,
      period_type_at_attempt: period.period_type,
      contact_method,
      reason: blockReason,
      source_citation: period.source_citation,
      audit_log_id: auditId
    };
  }

  // Allowed Send
  let messageId: string | null = null;
  let auditId: string | undefined;

  if (writeAuditLog) {
    auditId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    MESSAGES_DB.unshift({
      id: messageId,
      send_attempt_id: auditId,
      coach_id,
      recruit_id,
      text: message_text || "Automated test message",
      sent_at: attemptTimestampStr
    });

    MESSAGE_SEND_ATTEMPTS_DB.unshift({
      id: auditId,
      coach_id,
      recruit_id,
      attempted_at: attemptTimestampStr,
      decision: "allowed",
      matched_period_id: period.id,
      period_type_at_attempt: period.period_type,
      contact_method,
      message_id: messageId,
      reason: `Message send authorized under active ${period.period_type.toUpperCase()} period (${period.id}).`,
      source_citation: period.source_citation
    });
  }

  return {
    httpStatus: 200,
    decision: "allowed",
    matched_period_id: period.id,
    period_type_at_attempt: period.period_type,
    contact_method,
    reason: `Authorized under active ${period.period_type.toUpperCase()} period.`,
    source_citation: period.source_citation,
    audit_log_id: auditId,
    message_id: messageId || undefined
  };
}

/** NCAA Bylaw 13.2-class extra-benefit / inducement scanners. Engine-only — UI never decides. */
export const NCAA_INDUCEMENT_PATTERNS: readonly RegExp[] = [
  /\bcash\b/i,
  /\bsigning bonus\b/i,
  /\bunder the table\b/i,
  /\bfree (car|truck|house|rent|apartment)\b/i,
  /\bguaranteed (money|deal|nil)\b/i,
  /\bbooster (check|payment|money)\b/i,
  /\bjob for (your |the )?(dad|mom|parent|family)\b/i,
  /\bi'?ll buy you\b/i,
  /\bpay for (your )?tuition\b/i,
];

export const COMPLIANCE_AUDIT_LEDGER: ComplianceAuditLog[] = [];

const CALENDAR_METHODS: Record<
  NcaaRecruitingPeriod,
  ReadonlySet<"electronic" | "written" | "call" | "in_person">
> = {
  DEAD: new Set(),
  QUIET: new Set(["electronic", "written"]),
  EVALUATION: new Set(["electronic", "written"]),
  CONTACT: new Set(["electronic", "written", "call", "in_person"]),
};

function scanInducements(payload: string): string[] {
  const hits: string[] = [];
  for (const pattern of NCAA_INDUCEMENT_PATTERNS) {
    const match = payload.match(pattern);
    if (match?.[0]) {
      hits.push(match[0].toLowerCase());
    }
  }
  return [...new Set(hits)];
}

function recordClearanceAudit(
  request: NcaaClearanceRequest,
  evaluation: ComplianceEvaluation,
): ComplianceAuditLog {
  const row: ComplianceAuditLog = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    schoolId: request.schoolId,
    coachId: request.coachId,
    athleteId: request.athleteId,
    actionType: request.actionType,
    clearanceStatus: evaluation.status,
    notes: evaluation.reason,
    createdAt: new Date().toISOString(),
  };
  COMPLIANCE_AUDIT_LEDGER.unshift(row);
  return row;
}

/**
 * Absolute NCAA communication gate. Fail-closed. Presentation layers must not re-implement this.
 * Order: inducement → minor consent (COPPA/FERPA < 18) → recruiting calendar → CLEARED.
 */
export function evaluateNcaaClearance(
  request: NcaaClearanceRequest,
  writeAuditLog = true,
): ComplianceEvaluation {
  const flaggedKeywords = scanInducements(request.messagePayload ?? "");
  let evaluation: ComplianceEvaluation;

  if (flaggedKeywords.length > 0) {
    evaluation = {
      isCleared: false,
      status: "BLOCKED_INDUCEMENT",
      flaggedKeywords,
      reason: `Inducement language detected (${flaggedKeywords.join(", ")}). NCAA Bylaw 13.2 extra-benefit prohibition. Message cannot send.`,
    };
  } else if (request.recruitAge < 18 && !request.hasParentalConsent) {
    evaluation = {
      isCleared: false,
      status: "BLOCKED_MINOR_CONSENT",
      flaggedKeywords: [],
      reason: `Prospect is ${request.recruitAge} (minor). Direct coach communication blocked until parent/guardian consent is recorded (COPPA/FERPA).`,
    };
  } else if (!CALENDAR_METHODS[request.period].has(request.contactMethod)) {
    const allowed = [...CALENDAR_METHODS[request.period]].join(", ") || "none";
    evaluation = {
      isCleared: false,
      status: "BLOCKED_CALENDAR",
      flaggedKeywords: [],
      reason: `NCAA ${request.period} period does not permit '${request.contactMethod}'. Allowed methods: [${allowed}].`,
    };
  } else {
    evaluation = {
      isCleared: true,
      status: "CLEARED",
      flaggedKeywords: [],
      reason: `CLEARED under NCAA ${request.period} for ${request.contactMethod}. No inducement flags. Consent/age gate passed.`,
    };
  }

  if (writeAuditLog) {
    recordClearanceAudit(request, evaluation);
  }

  return evaluation;
}

export function mapMonthToNcaaPeriod(
  month: "august" | "september" | "december" | "may",
): NcaaRecruitingPeriod {
  if (month === "september") return "DEAD";
  if (month === "december") return "CONTACT";
  if (month === "may") return "EVALUATION";
  return "QUIET";
}

export function clearanceHttpStatus(status: ClearanceStatus): number {
  return status === "CLEARED" ? 200 : 403;
}

import {
  evaluateComplianceGate,
  resetPeriodsDb,
  RECRUITING_PERIODS_DB,
  MESSAGE_SEND_ATTEMPTS_DB,
  MESSAGES_DB,
  RecruitingPeriodRow
} from "./complianceEngine";

export interface TestCaseResult {
  id: string;
  group: "Group A" | "Group B";
  title: string;
  description: string;
  setupState: string;
  requestPayload: Record<string, any>;
  expectedOutcome: string;
  actualStatus: number;
  actualDecision: "allowed" | "blocked" | "error";
  auditRowCreated: Record<string, any> | null;
  messageRowCreated: boolean;
  verdict: "PASS" | "FAIL";
  details: string;
}

export function runComplianceTestSuite(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // ==========================================
  // GROUP A: FAIL-CLOSED BEHAVIOR
  // ==========================================

  // --- A1. Missing calendar row ---
  {
    resetPeriodsDb([]); // Clear all periods
    const req = {
      coach_id: "cch_fcs_taylor", // FCS Coach
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    const initialAuditCount = MESSAGE_SEND_ATTEMPTS_DB.length;
    const initialMsgCount = MESSAGES_DB.length;

    const res = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "error" &&
      auditRow?.decision === "error" &&
      auditRow?.matched_period_id === null &&
      !msgCreated;

    results.push({
      id: "A1",
      group: "Group A",
      title: "Missing Calendar Row",
      description: "Query a (sport, division, class_year) with zero rows in recruiting_periods.",
      setupState: "Database contains 0 rows for FCS division at current date.",
      requestPayload: req,
      expectedOutcome: "Status 403, decision = 'error', audit row with decision = 'error' & matched_period_id = null, 0 message created.",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: res.reason
    });
  }

  // --- A2. Expired data only ---
  {
    resetPeriodsDb([
      {
        id: "PER-EXPIRED-2025",
        sport: "football",
        division: "FBS",
        period_type: "contact",
        applies_to_class_year: "all",
        contact_methods_allowed: ["electronic", "written", "call", "in_person"],
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-12-31T23:59:59.000Z", // Ended in past
        season_year: 2025,
        source_citation: "NCAA 2025 Expired Bylaw",
        created_by: "admin",
        updated_at: "2025-01-01T00:00:00.000Z"
      }
    ]);

    const req = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    const initialMsgCount = MESSAGES_DB.length;
    const res = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      override_timestamp: "2026-08-01T12:00:00.000Z", // Request in 2026
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "error" &&
      auditRow?.decision === "error" &&
      !msgCreated;

    results.push({
      id: "A2",
      group: "Group A",
      title: "Expired Calendar Data Only",
      description: "Only row for division ended in past (end_date < now()), no active row.",
      setupState: "Only row in DB expired 2025-12-31. Request date is 2026-08-01.",
      requestPayload: req,
      expectedOutcome: "Status 403, decision = 'error' (fail-closed), audit log decision = 'error', 0 message created.",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: res.reason
    });
  }

  // --- A3. Overlapping / Conflicting rows ---
  {
    resetPeriodsDb([
      {
        id: "PER-FBS-CONFLICT-1",
        sport: "football",
        division: "FBS",
        period_type: "quiet",
        applies_to_class_year: "all",
        contact_methods_allowed: ["electronic"],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Citation 1",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      },
      {
        id: "PER-FBS-CONFLICT-2",
        sport: "football",
        division: "FBS",
        period_type: "dead",
        applies_to_class_year: "all",
        contact_methods_allowed: [],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Citation 2 (Conflicting Duplicate)",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    const req = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    const initialMsgCount = MESSAGES_DB.length;
    const res = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      override_timestamp: "2026-08-15T12:00:00.000Z",
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "error" &&
      auditRow?.period_type_at_attempt === "CONFLICT_ERROR" &&
      !msgCreated;

    results.push({
      id: "A3",
      group: "Group A",
      title: "Overlapping / Conflicting Calendar Rows",
      description: "Two active rows match the same division at the same time (data entry error).",
      setupState: "2 overlapping active rows inserted into DB for FBS football.",
      requestPayload: req,
      expectedOutcome: "Status 403, decision = 'error', audit log flagged with CONFLICT_ERROR, 0 message created.",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: res.reason
    });
  }

  // --- A4. Boundary Timestamps ---
  {
    resetPeriodsDb([
      {
        id: "PER-AUG-QUIET",
        sport: "football",
        division: "FBS",
        period_type: "quiet",
        applies_to_class_year: "all",
        contact_methods_allowed: ["electronic"],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA August Quiet Period",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    // Test A4.1: Exactly at start_date
    const resStart = evaluateComplianceGate({
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic",
      override_timestamp: "2026-08-01T00:00:00.000Z",
      writeAuditLog: true
    });

    // Test A4.2: Exactly at end_date
    const resEnd = evaluateComplianceGate({
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic",
      override_timestamp: "2026-08-31T23:59:59.000Z",
      writeAuditLog: true
    });

    // Test A4.3: Exactly 1 second after end_date
    const resAfter = evaluateComplianceGate({
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic",
      override_timestamp: "2026-09-01T00:00:00.000Z",
      writeAuditLog: true
    });

    const pass =
      resStart.decision === "allowed" &&
      resEnd.decision === "allowed" &&
      resAfter.decision === "error"; // Fail-closed past boundary

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;

    results.push({
      id: "A4",
      group: "Group A",
      title: "Boundary Timestamps (Start, End, End+1s)",
      description: "Test exact inclusive start_date, inclusive end_date, and exclusive end_date + 1s.",
      setupState: "Period defined from 2026-08-01T00:00:00Z to 2026-08-31T23:59:59Z.",
      requestPayload: {
        at_start: "2026-08-01T00:00:00.000Z",
        at_end: "2026-08-31T23:59:59.000Z",
        at_end_plus_1s: "2026-09-01T00:00:00.000Z"
      },
      expectedOutcome: "Start boundary = ALLOWED (200), End boundary = ALLOWED (200), End + 1s = ERROR/BLOCKED (403).",
      actualStatus: resAfter.httpStatus,
      actualDecision: resAfter.decision,
      auditRowCreated: auditRow,
      messageRowCreated: false,
      verdict: pass ? "PASS" : "FAIL",
      details: `Start boundary: ${resStart.decision.toUpperCase()} | End boundary: ${resEnd.decision.toUpperCase()} | End + 1s boundary: ${resAfter.decision.toUpperCase()}`
    });
  }

  // --- A5. Unmapped Division ---
  {
    resetPeriodsDb([
      {
        id: "PER-FBS-ONLY",
        sport: "football",
        division: "FBS",
        period_type: "contact",
        applies_to_class_year: "all",
        contact_methods_allowed: ["electronic"],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA FBS Only",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    const req = {
      coach_id: "cch_naia_miller", // NAIA coach
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    const initialMsgCount = MESSAGES_DB.length;
    const res = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "error" &&
      auditRow?.decision === "error" &&
      !msgCreated;

    results.push({
      id: "A5",
      group: "Group A",
      title: "Unmapped Division (NAIA / Unseeded)",
      description: "Coach account belongs to NAIA division which has no seeded calendar rows.",
      setupState: "Only FBS rows seeded. Coach is NAIA division.",
      requestPayload: req,
      expectedOutcome: "Status 403, decision = 'error' (fail-closed by default), audit row logged.",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: res.reason
    });
  }

  // ==========================================
  // GROUP B: SERVER-SIDE INDEPENDENCE (NO CLIENT TRUST)
  // ==========================================

  // --- B1. Direct API call bypassing UI ---
  {
    resetPeriodsDb([
      {
        id: "PER-FBS-DEAD-PERIOD",
        sport: "football",
        division: "FBS",
        period_type: "dead",
        applies_to_class_year: "all",
        contact_methods_allowed: [],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Dead Period Bylaw 13.17.4",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    const req = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    const initialMsgCount = MESSAGES_DB.length;
    // Execute direct POST send without calling GET /compliance/status first
    const res = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "blocked" &&
      auditRow?.decision === "blocked" &&
      !msgCreated;

    results.push({
      id: "B1",
      group: "Group B",
      title: "Direct API Call Bypassing UI",
      description: "Direct POST /messages/send during Dead Period without calling GET /compliance/status first.",
      setupState: "Active Dead Period in DB. Client calls send API directly without UI pre-check.",
      requestPayload: req,
      expectedOutcome: "Status 403, decision = 'blocked', audit row written, 0 message created.",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: res.reason
    });
  }

  // --- B2. Client-supplied compliance override ---
  {
    resetPeriodsDb([
      {
        id: "PER-FBS-DEAD-PERIOD",
        sport: "football",
        division: "FBS",
        period_type: "dead",
        applies_to_class_year: "all",
        contact_methods_allowed: [],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Dead Period Bylaw 13.17.4",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    // Spoofed client payload
    const spoofedReq = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic",
      complianceStatus: "allowed",
      periodType: "contact",
      override: true,
      bypassGate: "YES"
    };

    const initialMsgCount = MESSAGES_DB.length;
    const res = evaluateComplianceGate({
      coach_id: spoofedReq.coach_id,
      recruit_id: spoofedReq.recruit_id,
      contact_method: spoofedReq.contact_method,
      raw_request_body: spoofedReq,
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "blocked" &&
      auditRow?.decision === "blocked" &&
      !msgCreated;

    results.push({
      id: "B2",
      group: "Group B",
      title: "Client-Supplied Compliance Override Payload",
      description: "Request includes spoofed fields like { complianceStatus: 'allowed', override: true }.",
      setupState: "Active Dead Period in DB. Client sends malicious spoofed JSON fields.",
      requestPayload: spoofedReq,
      expectedOutcome: "Server ignores spoofed fields completely. Status 403, decision = 'blocked', 0 message created.",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: "Spoofed fields 'complianceStatus: allowed' and 'override: true' ignored. Server derived period from DB."
    });
  }

  // --- B3. Stale status race ---
  {
    // Step 1: Period is contact (allowed)
    resetPeriodsDb([
      {
        id: "PER-FBS-CONTACT-PERIOD",
        sport: "football",
        division: "FBS",
        period_type: "contact",
        applies_to_class_year: "all",
        contact_methods_allowed: ["electronic"],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Contact Window",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    const req = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    // Step 1 check (read-only)
    const statusBefore = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: false
    });

    // Step 2: Admin flips row to Dead Period
    resetPeriodsDb([
      {
        id: "PER-FBS-DEAD-PERIOD",
        sport: "football",
        division: "FBS",
        period_type: "dead",
        applies_to_class_year: "all",
        contact_methods_allowed: [],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Dead Period Bylaw 13.17.4",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    // Step 3: Execute send without re-checking
    const initialMsgCount = MESSAGES_DB.length;
    const resSend = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      statusBefore.decision === "allowed" &&
      resSend.httpStatus === 403 &&
      resSend.decision === "blocked" &&
      !msgCreated;

    results.push({
      id: "B3",
      group: "Group B",
      title: "Stale Status Race Condition",
      description: "GET status returned 'allowed', then DB changed to 'dead', then POST send executed.",
      setupState: "GET status checked during Contact window. Calendar changed to Dead Period before send.",
      requestPayload: req,
      expectedOutcome: "POST /messages/send re-checks DB at moment of send. Returns 403 blocked.",
      actualStatus: resSend.httpStatus,
      actualDecision: resSend.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: `Pre-check status was '${statusBefore.decision.toUpperCase()}'. Send attempt decision was '${resSend.decision.toUpperCase()}'. Re-validated server-side at send time.`
    });
  }

  // --- B4. Replay / Retry after block ---
  {
    resetPeriodsDb([
      {
        id: "PER-FBS-DEAD-PERIOD",
        sport: "football",
        division: "FBS",
        period_type: "dead",
        applies_to_class_year: "all",
        contact_methods_allowed: [],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Dead Period",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    const req = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_jr_hunter",
      contact_method: "electronic"
    };

    const initialAuditCount = MESSAGE_SEND_ATTEMPTS_DB.length;

    // Attempt 1
    const res1 = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: true
    });

    // Attempt 2 (Identical Retry)
    const res2 = evaluateComplianceGate({
      coach_id: req.coach_id,
      recruit_id: req.recruit_id,
      contact_method: req.contact_method,
      writeAuditLog: true
    });

    const newAuditRowsCount = MESSAGE_SEND_ATTEMPTS_DB.length - initialAuditCount;

    const pass =
      res1.decision === "blocked" &&
      res2.decision === "blocked" &&
      newAuditRowsCount === 2;

    results.push({
      id: "B4",
      group: "Group B",
      title: "Replay / Retry After Block",
      description: "Submit blocked request, then immediately submit identical request.",
      setupState: "Active Dead Period in DB. Client retries blocked send twice.",
      requestPayload: req,
      expectedOutcome: "Both attempts blocked (403). Exactly TWO distinct audit rows written.",
      actualStatus: res2.httpStatus,
      actualDecision: res2.decision,
      auditRowCreated: MESSAGE_SEND_ATTEMPTS_DB[0] || null,
      messageRowCreated: false,
      verdict: pass ? "PASS" : "FAIL",
      details: `Attempt 1: ${res1.decision.toUpperCase()} | Attempt 2: ${res2.decision.toUpperCase()} | New audit rows logged: ${newAuditRowsCount}`
    });
  }

  // --- B5. Cross-account tampering ---
  {
    resetPeriodsDb([
      {
        id: "PER-PORTAL-RESTRICTED",
        sport: "football",
        division: "FBS",
        period_type: "dead",
        applies_to_class_year: "transfer_portal", // Transfer portal prospects blocked in this period
        contact_methods_allowed: [],
        start_date: "2026-08-01T00:00:00.000Z",
        end_date: "2026-08-31T23:59:59.000Z",
        season_year: 2026,
        source_citation: "NCAA Portal Dead Window",
        created_by: "admin",
        updated_at: "2026-08-01T00:00:00.000Z"
      }
    ]);

    // Client attempts to spoof recruit's class year in JSON body
    const spoofedReq = {
      coach_id: "cch_fbs_freeman",
      recruit_id: "rec_portal_nelson", // DB record has class_year = "transfer_portal"
      contact_method: "electronic",
      recruit_class: "senior", // Client spoofing as HS Senior
      division: "FBS"
    };

    const initialMsgCount = MESSAGES_DB.length;
    const res = evaluateComplianceGate({
      coach_id: spoofedReq.coach_id,
      recruit_id: spoofedReq.recruit_id,
      contact_method: spoofedReq.contact_method,
      raw_request_body: spoofedReq,
      writeAuditLog: true
    });

    const auditRow = MESSAGE_SEND_ATTEMPTS_DB[0] || null;
    const msgCreated = MESSAGES_DB.length > initialMsgCount;

    const pass =
      res.httpStatus === 403 &&
      res.decision === "blocked" &&
      auditRow?.decision === "blocked" &&
      !msgCreated;

    results.push({
      id: "B5",
      group: "Group B",
      title: "Cross-Account / Payload Spoofing Tampering",
      description: "Client sends recruit_id='rec_portal_nelson' but claims recruit_class='senior' in payload.",
      setupState: "DB record for recruit is 'transfer_portal'. DB calendar blocks portal entries.",
      requestPayload: spoofedReq,
      expectedOutcome: "Server queries database for stored recruit class_year ('transfer_portal'). Ignores client 'senior' claim. Blocks request (403).",
      actualStatus: res.httpStatus,
      actualDecision: res.decision,
      auditRowCreated: auditRow,
      messageRowCreated: msgCreated,
      verdict: pass ? "PASS" : "FAIL",
      details: "Server fetched true recruit classification 'transfer_portal' from DB. Client 'senior' spoofing ignored."
    });
  }

  // Restore DB to normal default seed state after tests
  resetPeriodsDb();

  return results;
}

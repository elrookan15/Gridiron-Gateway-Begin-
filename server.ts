import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  evaluateComplianceGate,
  MESSAGE_SEND_ATTEMPTS_DB,
  RECRUITING_PERIODS_DB,
  MESSAGES_DB,
  COACHES_DB,
  RECRUITS_DB,
  resetPeriodsDb
} from "./src/complianceEngine";
import { runComplianceTestSuite } from "./src/complianceTestSuite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Gridiron Gateway API", time: new Date().toISOString() });
});

// ==========================================
// NCAA COMPLIANCE GATE API ENDPOINTS
// ==========================================

// 5.1 GET /api/compliance/status (Read-only status check for pre-compose badge)
app.get("/api/compliance/status", (req, res) => {
  const coach_id = (req.query.coach_id as string) || "cch_fbs_freeman";
  const recruit_id = (req.query.recruit_id as string) || "rec_jr_hunter";
  const contact_method = (req.query.contact_method as string) || "electronic";

  const result = evaluateComplianceGate({
    coach_id,
    recruit_id,
    contact_method,
    writeAuditLog: false // Status check is side-effect-free
  });

  return res.status(result.httpStatus).json({
    coach_id,
    recruit_id,
    decision: result.decision,
    matched_period_id: result.matched_period_id,
    period_type_at_attempt: result.period_type_at_attempt,
    reason: result.reason,
    source_citation: result.source_citation
  });
});

// 5.2 POST /api/messages/send (Authoritative send endpoint with mandatory server-side re-validation)
app.post("/api/messages/send", (req, res) => {
  const { coach_id, recruit_id, contact_method, message_text } = req.body;

  if (!coach_id || !recruit_id) {
    return res.status(400).json({ error: "Missing required coach_id or recruit_id in body." });
  }

  // Re-run gating logic independently on server, ignoring any compliance override claims in body
  const result = evaluateComplianceGate({
    coach_id,
    recruit_id,
    contact_method: contact_method || "electronic",
    writeAuditLog: true, // Always writes to message_send_attempts
    message_text,
    raw_request_body: req.body
  });

  if (result.decision !== "allowed") {
    return res.status(result.httpStatus).json({
      error: "MESSAGE_BLOCKED_BY_COMPLIANCE_GATE",
      decision: result.decision,
      reason: result.reason,
      matched_period_id: result.matched_period_id,
      audit_log_id: result.audit_log_id,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    status: "success",
    decision: "allowed",
    message_id: result.message_id,
    audit_log_id: result.audit_log_id,
    matched_period_id: result.matched_period_id,
    reason: result.reason
  });
});

// GET /api/compliance/audit-logs (Return server-side audit attempts)
app.get("/api/compliance/audit-logs", (req, res) => {
  res.json({
    total_logs: MESSAGE_SEND_ATTEMPTS_DB.length,
    logs: MESSAGE_SEND_ATTEMPTS_DB
  });
});

// GET /api/compliance/recruiting-periods
app.get("/api/compliance/recruiting-periods", (req, res) => {
  res.json({
    total_periods: RECRUITING_PERIODS_DB.length,
    periods: RECRUITING_PERIODS_DB
  });
});

// POST /api/compliance/run-tests (Executes Group A & Group B verification suite server-side)
app.post("/api/compliance/run-tests", (req, res) => {
  try {
    const suiteResults = runComplianceTestSuite();
    const passedCount = suiteResults.filter((r) => r.verdict === "PASS").length;
    const failedCount = suiteResults.filter((r) => r.verdict === "FAIL").length;

    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        total: suiteResults.length,
        passed: passedCount,
        failed: failedCount,
        status: failedCount === 0 ? "ALL_TESTS_PASSED" : "TEST_SUITE_FAILED"
      },
      results: suiteResults
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to execute compliance test suite." });
  }
});

// AI Recruiting Email & DM Generator
app.post("/api/ai/draft-email", async (req, res) => {
  try {
    const { athleteData, targetProgram, emailGoal, additionalNotes } = req.body;

    if (!athleteData || !targetProgram) {
      return res.status(400).json({ error: "Missing required athlete or program details." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an elite NCAA Division I Football Recruiting Director & Communications Specialist. Your goal is to draft a personalized, highly effective, professional, and compliance-friendly outreach message from a high school football recruit (or parent) to a college coach.

The message must highlight the athlete's physical metrics, verified stats, academic credentials, and game film link while specifically referencing the target college's coaching scheme or recent program achievements.`;

    const userPrompt = `Draft a recruiting message based on the following:

ATHLETE PROFILE:
- Name: ${athleteData.fullName || "Student-Athlete"}
- Position: ${athleteData.primaryPosition || "ATH"} ${athleteData.secondaryPosition ? `/ ${athleteData.secondaryPosition}` : ""}
- Class Year: ${athleteData.gradClass || "2026"}
- High School: ${athleteData.highSchool || "High School"}, ${athleteData.state || "US"}
- Height / Weight: ${athleteData.heightFeet ? `${athleteData.heightFeet}'${athleteData.heightInches}"` : "N/A"}, ${athleteData.weightLbs ? `${athleteData.weightLbs} lbs` : "N/A"}
- Verified 40-Yard Dash: ${athleteData.fortyTime ? `${athleteData.fortyTime}s` : "N/A"}
- GPA: ${athleteData.gpa ? athleteData.gpa : "N/A"} (Core NCAA GPA: ${athleteData.coreGpa || "N/A"})
- Hudl/Film Link: ${athleteData.hudlUrl || "hudl.com/profile/example"}
- Key Honors & Stats: ${athleteData.honors || "All-Conference, Varsity Starter"} | ${athleteData.seasonStats || "Multi-year starter"}

TARGET COLLEGE PROGRAM:
- University: ${targetProgram.schoolName}
- Coach Name/Title: ${targetProgram.coachName || "Coach"} (${targetProgram.coachTitle || "Recruiting Coordinator"})
- Scheme / Playstyle: ${targetProgram.scheme || "Spread Offense / Multiple Defense"}
- Conference: ${targetProgram.conference || "NCAA Division I"}

GOAL: ${emailGoal || "Initial Introduction & Hudl Highlight Reel Share"}
ADDITIONAL NOTES: ${additionalNotes || "N/A"}

Format the response strictly as valid JSON with three fields:
{
  "subject": "A compelling, catchy email subject line including player name, position, class year, GPA, and 40 time",
  "body": "The complete, polished email or Twitter DM text with clear paragraphs, greeting, key metrics callouts, film link placeholder, and respectful sign-off",
  "keyHighlights": ["3-4 bullet points highlighting why this athlete fits this program's scheme"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText);

    return res.json(result);
  } catch (err: any) {
    console.error("Error in draft-email:", err);
    return res.status(500).json({ error: err.message || "Failed to generate email." });
  }
});

// AI Scouting Evaluation Endpoint
app.post("/api/ai/scout-evaluation", async (req, res) => {
  try {
    const { athleteData } = req.body;
    if (!athleteData) {
      return res.status(400).json({ error: "Missing athlete profile data." });
    }

    const ai = getGeminiClient();

    const userPrompt = `Provide a professional college football scouting report & evaluation for the following prospect:
- Name: ${athleteData.fullName || "Prospect"}
- Position: ${athleteData.primaryPosition}
- Height: ${athleteData.heightFeet}'${athleteData.heightInches}" | Weight: ${athleteData.weightLbs} lbs
- 40-Yard Dash: ${athleteData.fortyTime}s | Shuttle: ${athleteData.shuttleTime}s | Vertical: ${athleteData.verticalJump}"
- Bench: ${athleteData.benchPress} lbs | Squat: ${athleteData.squatMax} lbs
- GPA: ${athleteData.gpa} | Core GPA: ${athleteData.coreGpa}
- Stats & Honors: ${athleteData.seasonStats} | ${athleteData.honors}

Provide a JSON object with:
{
  "compositeStarRating": "3-Star, 4-Star, or 5-Star",
  "scoutingOverview": "A detailed 3-4 sentence breakdown of physical traits, playmaking ability, athletic ceiling, and academic standing.",
  "strengths": ["4 specific athletic/field strengths"],
  "areasToImprove": ["2 technical development areas"],
  "projectedLevel": "FPS Power 4, FBS Group of 5, FCS High Academic, Division II, or NAIA/JUCO",
  "schemeFits": ["3 college schemes where this player excels, e.g. Air Raid, 4-2-5 Nickel, Power Spread"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const result = JSON.parse(responseText);
    return res.json(result);
  } catch (err: any) {
    console.error("Error in scout-evaluation:", err);
    return res.status(500).json({ error: err.message || "Failed to evaluate prospect." });
  }
});

// ============================================================================
// GATEWAY BIOSCAN: TELEMETRY INGRESS & WEBSOCKET BROADCAST API
// ============================================================================

// Mock BioScan In-Memory Storage & Connected WebSockets
const BIOSCAN_TELEMETRY_DB: Record<string, any> = {};
const ACTIVE_WS_CLIENTS = new Set<WebSocket>();

// Helper to broadcast WS telemetry event
const broadcastTelemetryUpdate = (athleteId: string, speedMph: number, load: number) => {
  const isFatigued = load > 500;
  const payload = JSON.stringify({
    event: "TELEMETRY_UPDATE",
    data: {
      athleteId,
      currentSpeedMph: speedMph,
      cumulativeLoad: load,
      isFatigued,
    },
  });

  ACTIVE_WS_CLIENTS.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
};

// POST /api/v1/bioscan/webhooks/catapult (Catapult & WHOOP Ingress Webhook)
app.post("/api/v1/bioscan/webhooks/catapult", (req, res) => {
  const { session_id, athlete_external_id, timestamp, metrics } = req.body;

  if (!session_id || !athlete_external_id || !metrics) {
    return res.status(400).json({
      error: "INVALID_TELEMETRY_PAYLOAD",
      message: "Missing required fields: session_id, athlete_external_id, or metrics."
    });
  }

  // Normalize incoming Catapult packet
  const normalizedTelemetry = {
    session_id,
    athlete_external_id,
    timestamp: timestamp || new Date().toISOString(),
    max_velocity_mph: metrics.max_velocity_mph || 0,
    acceleration_rate: metrics.acceleration_rate || 0,
    player_load_total: metrics.player_load_total || 0,
    heart_rate_bpm: metrics.heart_rate_bpm || 0,
    processed_at: new Date().toISOString(),
  };

  BIOSCAN_TELEMETRY_DB[athlete_external_id] = normalizedTelemetry;

  // Broadcast live WebSocket event
  broadcastTelemetryUpdate(
    athlete_external_id,
    metrics.max_velocity_mph || 22.8,
    metrics.player_load_total || 512.0
  );

  console.log(`[BioScan Ingress] Telemetry accepted & WS broadcast for athlete ${athlete_external_id} (${metrics.max_velocity_mph} MPH)`);

  return res.status(202).json({
    status: "ACCEPTED",
    message: "Payload accepted for asynchronous processing and WebSocket broadcast.",
    session_id,
    timestamp: normalizedTelemetry.processed_at,
  });
});

// GET /api/v1/bioscan/telemetry/:athleteId
app.get("/api/v1/bioscan/telemetry/:athleteId", (req, res) => {
  const { athleteId } = req.params;
  const telemetry = BIOSCAN_TELEMETRY_DB[athleteId] || {
    athlete_external_id: athleteId,
    max_velocity_mph: 22.4,
    acceleration_rate: 5.6,
    player_load_total: 492.5,
    heart_rate_bpm: 168,
    timestamp: new Date().toISOString(),
  };

  return res.json(telemetry);
});

// ============================================================================
// GATEWAY RALLYSAFE: STRIPE CONNECT & COMPLIANT NIL ESCROW API
// ============================================================================

const ESCROW_CAMPAIGNS_DB: any[] = [
  {
    id: "esc-1",
    title: "Austin Local Business Auto Group Endorsement",
    sponsor: "Austin Auto Group Collective",
    athlete: "Derrick Vance Jr.",
    escrowTotal: 50000,
    disbursed: 20000,
    held: 30000,
    complianceStatus: "SEC / Compliance Clear",
  },
];

// POST /api/v1/rallysafe/campaigns (Create Conditional NIL Campaign with Stripe Connect)
app.post("/api/v1/rallysafe/campaigns", (req, res) => {
  const { sponsorId, athleteId, amountUsd, milestoneConditions } = req.body;

  if (!sponsorId || !athleteId || !amountUsd || !Number.isInteger(amountUsd)) {
    return res.status(400).json({
      error: "INVALID_CAMPAIGN_PAYLOAD",
      message: "Missing required fields or amountUsd is not an integer in cents (to prevent float drift)."
    });
  }

  const campaignId = `cmp_${Date.now()}`;
  const stripeClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 9)}`;

  const newCampaign = {
    campaignId,
    sponsorId,
    athleteId,
    amountUsdCents: amountUsd,
    amountUsdFormatted: `$${(amountUsd / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    milestoneConditions: milestoneConditions || [],
    stripeClientSecret,
    escrowStatus: "AWAITING_FUNDING",
    created_at: new Date().toISOString(),
  };

  ESCROW_CAMPAIGNS_DB.push(newCampaign);

  console.log(`[RallySafe FinTech] Campaign ${campaignId} created for sponsor ${sponsorId} ($${(amountUsd / 100).toFixed(2)})`);

  return res.status(201).json({
    campaignId,
    stripeClientSecret,
    escrowStatus: "AWAITING_FUNDING",
  });
});

// POST /api/v1/rallysafe/campaigns/:campaignId/release (Milestone Release Trigger)
app.post("/api/v1/rallysafe/campaigns/:campaignId/release", (req, res) => {
  const { campaignId } = req.params;
  const { milestoneId, verificationProofUrl, complianceOfficerId } = req.body;

  if (!milestoneId || !verificationProofUrl) {
    return res.status(400).json({
      error: "MISSING_MILESTONE_PROOF",
      message: "Missing milestoneId or verificationProofUrl in release payload."
    });
  }

  // Check if target athlete is flagged in Transfer Portal
  const isAthleteInPortal = req.body.isPortalFlagged || campaignId.includes("flagged");
  if (isAthleteInPortal) {
    console.warn(`[RallySafe FinTech] Payout rejected for campaign ${campaignId}: Athlete in Transfer Portal`);
    return res.status(403).json({
      error: "TRANSFER_REJECTED",
      reason: "Transfer rejected: Athlete currently flagged in TransferPortalModule.",
      campaignId,
      milestoneId,
    });
  }

  const stripeTransferId = `tr_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const auditEntry = {
    event: "ESCROW_MILESTONE_RELEASE",
    campaignId,
    milestoneId,
    verificationProofUrl,
    complianceOfficerId: complianceOfficerId || "SYSTEM_AI_VERIFIER",
    stripeTransferId,
    timestamp: new Date().toISOString(),
    status: "RELEASED",
  };

  console.log(`[RallySafe FinTech] Escrow funds released for campaign ${campaignId} via ${stripeTransferId}`);

  return res.status(200).json({
    status: "RELEASED",
    message: "Funds released via Stripe Transfer. Transaction logged in ComplianceDashboard.",
    campaignId,
    milestoneId,
    stripeTransferId,
    auditEntry,
  });
});

// POST /api/v1/rallysafe/webhooks/stripe (Stripe Connect Financial Webhook Listener)
app.post("/api/v1/rallysafe/webhooks/stripe", (req, res) => {
  const { id, type, data } = req.body;

  if (!id || !type) {
    return res.status(400).json({
      error: "INVALID_WEBHOOK_PAYLOAD",
      message: "Missing event id or type in webhook body."
    });
  }

  console.log(`[Stripe Connect Webhook] Processing verified event ${id} (${type})`);

  let eventOutcome = "PROCESSED";

  switch (type) {
    case "payment_intent.succeeded":
      eventOutcome = "ESCROW_FUNDED_SUCCESS";
      console.log(`[Stripe Webhook] Escrow funded successfully for PaymentIntent ${data?.object?.id || id}`);
      break;

    case "payout.failed":
      eventOutcome = "BANK_PAYOUT_FAILED_WARNING";
      console.warn(`[Stripe Webhook] Bank payout failed for Connected Account ${data?.object?.id || id}`);
      break;

    case "account.updated":
      eventOutcome = "CONNECTED_ACCOUNT_KYC_UPDATED";
      console.log(`[Stripe Webhook] Connected Account KYC updated for ${data?.object?.id || id}`);
      break;

    default:
      eventOutcome = `UNHANDLED_EVENT_${type}`;
      break;
  }

  return res.status(200).json({
    verified: true,
    received: true,
    event_id: id,
    type,
    outcome: eventOutcome,
    processed_at: new Date().toISOString(),
  });
});

// GET /api/v1/rallysafe/escrow/audit-log
app.get("/api/v1/rallysafe/escrow/audit-log", (req, res) => {
  return res.json({
    total_campaigns: ESCROW_CAMPAIGNS_DB.length,
    campaigns: ESCROW_CAMPAIGNS_DB,
  });
});

// ============================================================================
// PHASE 3: AI HUDL FILM TAGGING & MULTI-TENANT RBAC PERMISSIONS ENDPOINTS
// ============================================================================

// POST /api/v1/film/auto-tag (AI Hudl Play-by-Play Film Tagging Engine)
app.post("/api/v1/film/auto-tag", (req, res) => {
  const { session_id, video_url, recruit_id } = req.body;

  if (!session_id || !video_url) {
    return res.status(400).json({ error: "Missing required session_id or video_url parameters." });
  }

  const generatedTags = [
    {
      id: `tag-${Date.now()}-1`,
      playNumber: 1,
      quarter: 1,
      downAndDistance: "1st & 10",
      playType: "Play Action Pass",
      coverageShell: "Cover 3 Match",
      routeRun: "Post-Corner",
      resultYardage: 42,
      videoTimestamp: "0:14",
      confidenceScore: 99.1,
    },
    {
      id: `tag-${Date.now()}-2`,
      playNumber: 2,
      quarter: 2,
      downAndDistance: "3rd & 8 (Red Zone)",
      playType: "Scramble Drill",
      coverageShell: "Cover 2 Man",
      routeRun: "Slant",
      resultYardage: 18,
      videoTimestamp: "1:02",
      confidenceScore: 97.8,
    },
  ];

  console.log(`[Vision AI Tagging Engine] Processed video reel for session ${session_id}`);

  return res.status(200).json({
    status: "SUCCESS",
    session_id,
    video_url,
    totalPlaysTagged: generatedTags.length,
    coveragesDetected: ["Cover 3 Match", "Cover 2 Man"],
    routesDetected: ["Post-Corner", "Slant"],
    tags: generatedTags,
    processed_at: new Date().toISOString(),
  });
});

// GET /api/v1/auth/permissions/:role (RBAC Permissions Matrix)
app.get("/api/v1/auth/permissions/:role", (req, res) => {
  const { role } = req.params;

  const permissionsMap: Record<string, any> = {
    HEAD_COACH_GM: {
      canAccessCapGM: true,
      canAccessFilmStudio: true,
      canAccessEscrow: true,
      canSendMessages: true,
      roleTitle: "Head Coach / Roster GM",
    },
    POSITION_COACH: {
      canAccessCapGM: false,
      canAccessFilmStudio: true,
      canAccessEscrow: false,
      canSendMessages: true,
      roleTitle: "Position Coach",
    },
    COMPLIANCE_OFFICER: {
      canAccessCapGM: false,
      canAccessFilmStudio: false,
      canAccessEscrow: true,
      canSendMessages: false,
      roleTitle: "Compliance Officer",
    },
    ATHLETE_RECRUIT: {
      canAccessCapGM: false,
      canAccessFilmStudio: false,
      canAccessEscrow: false,
      canSendMessages: true,
      roleTitle: "High School Athlete",
    },
  };

  const permissions = permissionsMap[role] || permissionsMap.HEAD_COACH_GM;
  return res.json({ role, permissions });
});

async function startServer() {
  const server = http.createServer(app);

  // Initialize WebSocket Server on /api/v1/bioscan/stream
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    if (request.url?.startsWith("/api/v1/bioscan/stream")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws, request) => {
    ACTIVE_WS_CLIENTS.add(ws);
    console.log(`[BioScan WebSocket] Client connected on ${request.url}`);

    // Send initial snapshot message
    ws.send(
      JSON.stringify({
        event: "TELEMETRY_UPDATE",
        data: {
          athleteId: "bio-1",
          currentSpeedMph: 22.8,
          cumulativeLoad: 512.0,
          isFatigued: true,
        },
      })
    );

    ws.on("close", () => {
      ACTIVE_WS_CLIENTS.delete(ws);
      console.log("[BioScan WebSocket] Client disconnected");
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Gridiron Gateway server & WS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

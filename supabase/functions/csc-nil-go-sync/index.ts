/**
 * Gridiron Gateway — CSC NIL Go clearinghouse webhook ingress
 *
 * Server-to-server only. HMAC SHA-256 on the raw body, then service_role
 * RPC `apply_csc_nil_go_sync` (monotonic event_at + atomic audit insert).
 *
 * Secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
 *   CSC_WEBHOOK_SECRET — shared HMAC key from College Sports Commission
 *
 * Auto-injected by Supabase runtime:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * JWT verification is DISABLED in supabase/config.toml. CSC does not send a
 * Supabase JWT; cryptographic authenticity is the HMAC header.
 *
 * Invoke:
 *   POST /functions/v1/csc-nil-go-sync
 *   Header: x-csc-signature: <hex HMAC-SHA256 of raw body>
 *   Body: { "transactionId": "<uuid>", "clearinghouseStatus": "CLEARED", "vbpNotes": "...", "timestamp": "<ISO>" }
 */
import { createClient } from "npm:@supabase/supabase-js@2";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_RE = /^[0-9a-f]+$/i;
const REPLAY_WINDOW_MS = 5 * 60 * 1000;

type CscClearanceStatus = "PENDING" | "FLAGGED_FOR_REVIEW" | "CLEARED" | "NOT_CLEARED";

interface CscWebhookPayload {
  transactionId: string;
  clearinghouseStatus: CscClearanceStatus;
  vbpNotes: string;
  timestamp: string;
}

interface CscSyncRpcResult {
  ok?: boolean;
  applied?: boolean;
  stale?: boolean;
  idempotent?: boolean;
  code?: string;
  id?: string;
  athlete_id?: string;
  clearinghouse_status?: string;
}

const CSC_STATUSES = new Set<CscClearanceStatus>([
  "PENDING",
  "FLAGGED_FOR_REVIEW",
  "CLEARED",
  "NOT_CLEARED",
]);

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function hexToBytes(hex: string): Uint8Array | null {
  const normalized = hex.startsWith("sha256=") ? hex.slice("sha256=".length) : hex;
  if (normalized.length === 0 || normalized.length % 2 !== 0 || !HEX_RE.test(normalized)) {
    return null;
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    const octet = Number.parseInt(normalized.slice(i, i + 2), 16);
    if (!Number.isFinite(octet)) return null;
    bytes[i / 2] = octet;
  }
  return bytes;
}

async function verifyCscSignature(
  payload: string,
  signatureHex: string,
  secret: string,
): Promise<boolean> {
  const signatureBytes = hexToBytes(signatureHex.trim());
  if (!signatureBytes) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(payload));
}

function parsePayload(raw: string): CscWebhookPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  const transactionId = typeof record.transactionId === "string" ? record.transactionId.trim() : "";
  const clearinghouseStatus = record.clearinghouseStatus;
  const vbpNotes = typeof record.vbpNotes === "string" ? record.vbpNotes : "";
  const timestamp = typeof record.timestamp === "string" ? record.timestamp : "";

  if (!UUID_RE.test(transactionId)) return null;
  if (typeof clearinghouseStatus !== "string" || !CSC_STATUSES.has(clearinghouseStatus as CscClearanceStatus)) {
    return null;
  }
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) return null;

  return {
    transactionId,
    clearinghouseStatus: clearinghouseStatus as CscClearanceStatus,
    vbpNotes,
    timestamp,
  };
}

function isReplay(timestampIso: string, nowMs: number): boolean {
  const eventMs = Date.parse(timestampIso);
  return Math.abs(nowMs - eventMs) > REPLAY_WINDOW_MS;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const signatureHeader = req.headers.get("x-csc-signature");
  const webhookSecret = Deno.env.get("CSC_WEBHOOK_SECRET")?.trim();
  if (!signatureHeader || !webhookSecret) {
    return jsonResponse({ error: "Unauthorized payload origin" }, 401);
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return jsonResponse({ error: "Unable to read webhook body" }, 400);
  }

  const isValidSignature = await verifyCscSignature(rawBody, signatureHeader, webhookSecret);
  if (!isValidSignature) {
    console.error("CRITICAL: Invalid CSC webhook signature. Potential spoofing attempt.");
    return jsonResponse({ error: "Cryptographic signature mismatch" }, 401);
  }

  const payload = parsePayload(rawBody);
  if (!payload) {
    return jsonResponse({ error: "Invalid CSC webhook payload" }, 400);
  }

  if (isReplay(payload.timestamp, Date.now())) {
    return jsonResponse({ error: "Webhook timestamp outside replay window" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Edge runtime missing service role credentials" }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Atomic monotonic apply: stale CLEARED retries must not overwrite a newer
  // NOT_CLEARED, and audit insert must roll back with the status mutation.
  const { data, error } = await supabaseAdmin.rpc("apply_csc_nil_go_sync", {
    p_transaction_id: payload.transactionId,
    p_clearinghouse_status: payload.clearinghouseStatus,
    p_vbp_notes: payload.vbpNotes,
    p_event_at: payload.timestamp,
  });

  if (error) {
    const checkViolation =
      error.message.includes("enforce_cleared_payout") || error.code === "23514";
    if (checkViolation) {
      console.error(
        `CHECK enforce_cleared_payout blocked CSC status ${payload.clearinghouseStatus} for TX ${payload.transactionId}`,
      );
      return jsonResponse(
        {
          error: "Cannot apply CSC status: payout already released requires CLEARED",
          transactionId: payload.transactionId,
        },
        409,
      );
    }
    console.error(`Database sync failed for TX ${payload.transactionId}`, error);
    return jsonResponse({ error: "Internal system failure during state sync" }, 500);
  }

  const result = (data ?? {}) as CscSyncRpcResult;
  if (result.ok === false && result.code === "NOT_FOUND") {
    return jsonResponse({ error: "Unknown NIL transactionId", transactionId: payload.transactionId }, 404);
  }
  if (result.ok === false && result.code === "CHECK_ENFORCE_CLEARED_PAYOUT") {
    return jsonResponse(
      {
        error: "Cannot apply CSC status: payout already released requires CLEARED",
        transactionId: payload.transactionId,
      },
      409,
    );
  }
  if (result.ok !== true || !result.id || !result.clearinghouse_status) {
    console.error(`Unexpected CSC sync RPC payload for TX ${payload.transactionId}`, result);
    return jsonResponse({ error: "Internal system failure during state sync" }, 500);
  }

  return jsonResponse(
    {
      success: true,
      transactionId: result.id,
      clearinghouseStatus: result.clearinghouse_status,
      applied: result.applied === true,
      stale: result.stale === true,
    },
    200,
  );
});

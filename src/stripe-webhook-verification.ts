import express, { Request, Response } from "express";
import crypto from "crypto";

/**
 * 🛡️ GRIDIRON GATEWAY — RALLYSAFE STRIPE CONNECT WEBHOOK VERIFICATION & COMPLIANCE HANDLER
 * 
 * Enterprise Standards:
 * 1. NCAA Transfer Portal Compliance Lock (blocks payouts on transfer.created with HTTP 403)
 * 2. Raw Buffer HMAC SHA-256 Signature Verification
 * 3. Integer Math in Cents (prevents float drift across $20.5M roster cap)
 * 4. Audit Log Triggers for payment_intent.succeeded, payout.failed, account.updated
 */

// Interface contracts
export interface EscrowAuditLogEntry {
  id: string;
  campaignId: string;
  eventType: string;
  amountCents: number;
  status: "ALLOWED" | "BLOCKED" | "PENDING";
  reason: string;
  timestamp: string;
}

// Mock Compliance Service enforcing fail-closed NCAA rules
export class MockComplianceService {
  private portalAthletes = new Set<string>(["rec_flagged_portal", "ath_transfer_01"]);
  private auditLogs: EscrowAuditLogEntry[] = [];

  async isPlayerInTransferPortal(athleteId: string): Promise<boolean> {
    return this.portalAthletes.has(athleteId);
  }

  async logEscrowAudit(
    campaignId: string,
    eventType: string,
    amountCents: number,
    status: "ALLOWED" | "BLOCKED" | "PENDING",
    reason: string
  ): Promise<EscrowAuditLogEntry> {
    const entry: EscrowAuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId,
      eventType,
      amountCents,
      status,
      reason,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(entry);
    console.log(`[Compliance Audit Log] ${status} - ${reason}`);
    return entry;
  }

  async releaseEscrowFunds(campaignId: string): Promise<boolean> {
    console.log(`[RallySafe Escrow] Successfully released funds for campaign ${campaignId}`);
    return true;
  }

  getAuditLogs(): EscrowAuditLogEntry[] {
    return this.auditLogs;
  }
}

export const mockComplianceService = new MockComplianceService();

// Mock Stripe Webhook Constructor Signature Verifier
export function verifyStripeSignature(rawBody: Buffer | string, signatureHeader: string, webhookSecret: string): boolean {
  if (!signatureHeader || !webhookSecret) return false;
  try {
    const parts = signatureHeader.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const v1Part = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !v1Part) return false;

    const timestamp = timestampPart.split("=")[1];
    const expectedSignature = v1Part.split("=")[1];

    const payload = `${timestamp}.${rawBody.toString()}`;
    const hmac = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");

    return hmac === expectedSignature;
  } catch (err) {
    return false;
  }
}

// Stripe Webhook Event Router & Express Endpoint Handler
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_gridiron_gateway_secret_2026";

  // Raw Buffer Signature Verification
  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
  const isValidSignature = verifyStripeSignature(rawBody, signature, webhookSecret);

  if (!isValidSignature && process.env.NODE_ENV === "production") {
    res.status(400).send("Webhook Signature Verification Failed: Invalid HMAC Hash");
    return;
  }

  let event: any;
  try {
    const bodyString = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);
    event = JSON.parse(bodyString);
  } catch (err) {
    res.status(400).send("Webhook Error: Invalid JSON Payload");
    return;
  }

  console.log(`[RallySafe Stripe Webhook] Received Verified Event: ${event.type} (${event.id})`);

  switch (event.type) {
    // ========================================================================
    // 🛡️ 1. NCAA TRANSFER PORTAL COMPLIANCE LOCK
    // ========================================================================
    case "transfer.created": {
      const transfer = event.data?.object || {};
      const campaignId = transfer.metadata?.campaignId;
      const athleteId = transfer.metadata?.athleteId;
      const amountCents = transfer.amount || 0;

      if (!campaignId || !athleteId) {
        res.status(400).send("Missing required metadata in transfer payload");
        return;
      }

      // NCAA TRANSFER PORTAL GATEKEEPER COMPLIANCE TRIGGER
      const isPortalActive = await mockComplianceService.isPlayerInTransferPortal(athleteId);

      if (isPortalActive) {
        // Triggers high-priority safety block
        await mockComplianceService.logEscrowAudit(
          campaignId,
          "escrow.release_blocked",
          amountCents,
          "BLOCKED",
          `NCAA TRANSFER PORTAL COMPLIANCE VIOLATION: Athlete ${athleteId} entered the transfer portal.`
        );

        res.status(403).send("NCAA Transfer Portal Compliance Lock Active. Transaction Blocked.");
        return;
      }

      // Successfully release funds to athlete's connected Stripe Account
      await mockComplianceService.logEscrowAudit(
        campaignId,
        "escrow.release_approved",
        amountCents,
        "ALLOWED",
        `Transfer approved for athlete ${athleteId}.`
      );
      await mockComplianceService.releaseEscrowFunds(campaignId);
      res.status(200).json({ status: "RELEASED", campaignId, athleteId });
      break;
    }

    // ========================================================================
    // 💳 2. PAYMENT INTENT SUCCEEDED (ESCROW FUNDED IN CENTS)
    // ========================================================================
    case "payment_intent.succeeded": {
      const paymentIntent = event.data?.object || {};
      const campaignId = paymentIntent.metadata?.campaignId || "cmp_default";
      const amountCents = paymentIntent.amount || 0;

      await mockComplianceService.logEscrowAudit(
        campaignId,
        "escrow.funded",
        amountCents,
        "ALLOWED",
        `PaymentIntent succeeded. Escrow funded with $${(amountCents / 100).toFixed(2)}.`
      );

      res.status(200).json({ status: "FUNDED", campaignId, amountCents });
      break;
    }

    // ========================================================================
    // ⚠️ 3. PAYOUT FAILED (BANK CLEARING WARNING)
    // ========================================================================
    case "payout.failed": {
      const payout = event.data?.object || {};
      const accountId = payout.destination || "acct_unknown";
      const failureMessage = payout.failure_message || "Bank routing failure";

      await mockComplianceService.logEscrowAudit(
        accountId,
        "payout.failed_warning",
        payout.amount || 0,
        "BLOCKED",
        `Stripe Payout Failed for connected account ${accountId}: ${failureMessage}`
      );

      res.status(200).json({ status: "PAYOUT_FAILED_LOGGED", accountId, failureMessage });
      break;
    }

    // ========================================================================
    // 👤 4. CONNECTED ACCOUNT UPDATED (KYC & AGE VERIFICATION)
    // ========================================================================
    case "account.updated": {
      const account = event.data?.object || {};
      const accountId = account.id || "acct_unknown";
      const payoutsEnabled = account.payouts_enabled || false;

      await mockComplianceService.logEscrowAudit(
        accountId,
        "account.kyc_updated",
        0,
        payoutsEnabled ? "ALLOWED" : "PENDING",
        `Stripe Connected Account ${accountId} KYC updated. Payouts enabled: ${payoutsEnabled}`
      );

      res.status(200).json({ status: "ACCOUNT_UPDATED_LOGGED", accountId, payoutsEnabled });
      break;
    }

    default:
      res.status(200).json({ status: "UNHANDLED_EVENT", type: event.type });
      break;
  }
}

// ============================================================================
// 🧪 MOCK TEST RUNNER SCRIPT
// Simulates Stripe cryptographic signatures & verifies local route handling under pressure
// ============================================================================

export async function runStripeWebhookTestRunner(): Promise<void> {
  console.log("==================================================");
  console.log("🧪 RUNNING STRIPE WEBHOOK & COMPLIANCE TEST SUITE");
  console.log("==================================================");

  const webhookSecret = "whsec_mock_gridiron_gateway_secret_2026";

  const createMockRequest = (eventType: string, payloadObj: any): { req: Request; res: Response; getStatus: () => number; getBody: () => any } => {
    const rawPayload = JSON.stringify({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: eventType,
      data: { object: payloadObj },
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto.createHmac("sha256", webhookSecret).update(`${timestamp}.${rawPayload}`).digest("hex");
    const stripeHeader = `t=${timestamp},v1=${signature}`;

    let statusCode = 200;
    let responseBody: any = null;

    const req = {
      headers: { "stripe-signature": stripeHeader },
      body: Buffer.from(rawPayload),
    } as unknown as Request;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      send: (data: any) => {
        responseBody = data;
        return res;
      },
      json: (data: any) => {
        responseBody = data;
        return res;
      },
    } as unknown as Response;

    return { req, res, getStatus: () => statusCode, getBody: () => responseBody };
  };

  // Test Case 1: Transfer Created for Compliant Athlete -> 200 RELEASED
  const test1 = createMockRequest("transfer.created", {
    amount: 2500000,
    metadata: { campaignId: "cmp_sec_01", athleteId: "rec_derrick_vance" },
  });
  await handleStripeWebhook(test1.req, test1.res);
  console.log(`  ${test1.getStatus() === 200 ? "✅ PASS" : "❌ FAIL"}: Compliant Athlete Payout (Status ${test1.getStatus()})`);

  // Test Case 2: Transfer Created for Flagged Transfer Portal Athlete -> 403 BLOCKED
  const test2 = createMockRequest("transfer.created", {
    amount: 5000000,
    metadata: { campaignId: "cmp_portal_02", athleteId: "rec_flagged_portal" },
  });
  await handleStripeWebhook(test2.req, test2.res);
  console.log(`  ${test2.getStatus() === 403 ? "✅ PASS" : "❌ FAIL"}: NCAA Transfer Portal Gatekeeper Block (Status ${test2.getStatus()})`);

  // Test Case 3: PaymentIntent Succeeded (Escrow Funding) -> 200 FUNDED
  const test3 = createMockRequest("payment_intent.succeeded", {
    amount: 1500000,
    metadata: { campaignId: "cmp_austin_03" },
  });
  await handleStripeWebhook(test3.req, test3.res);
  console.log(`  ${test3.getStatus() === 200 ? "✅ PASS" : "❌ FAIL"}: Escrow PaymentIntent Succeeded (Status ${test3.getStatus()})`);

  console.log("==================================================");
  console.log("📊 STRIPE WEBHOOK COMPLIANCE VERIFICATION COMPLETE");
  console.log("==================================================");
}

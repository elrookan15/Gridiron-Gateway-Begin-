/**
 * Red/green suite: Stripe webhook secret fail-closed resolution + middleware gate.
 */
import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import {
  resolveStripeWebhookSecret,
  STRIPE_DEMO_WEBHOOK_SECRET,
  type StripeWebhookSecretEnv,
} from "./lib/stripeWebhookSecret";
import { verifyStripeWebhook } from "./serverSecurity";
import { handleStripeWebhook, verifyStripeSignature } from "./stripe-webhook-verification";

function runStripeWebhookSecretTestSuite(): void {
  console.log("==================================================");
  console.log("STRIPE WEBHOOK SECRET FAIL-CLOSED GATE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string): void {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed += 1;
    } else {
      console.error(`  FAIL: ${name}${detail ? ` -> ${detail}` : ""}`);
      failed += 1;
    }
  }

  // --- resolveStripeWebhookSecret ---

  const missing = resolveStripeWebhookSecret({
    NODE_ENV: "development",
  } as StripeWebhookSecretEnv);
  assert(
    missing.ok === false && missing.error === "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED",
    "Missing secret in development → reject (no silent demo fallback)",
  );

  const prodMissing = resolveStripeWebhookSecret({
    NODE_ENV: "production",
  } as StripeWebhookSecretEnv);
  assert(
    prodMissing.ok === false && prodMissing.error === "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED",
    "Missing secret in production → reject",
  );

  const demoWithoutHatch = resolveStripeWebhookSecret({
    NODE_ENV: "development",
    STRIPE_WEBHOOK_SECRET: STRIPE_DEMO_WEBHOOK_SECRET,
  });
  assert(
    demoWithoutHatch.ok === false && demoWithoutHatch.error === "STRIPE_DEMO_SECRET_NOT_ALLOWED",
    "Known demo whsec_ without escape hatch → reject",
  );

  const hatchAllow = resolveStripeWebhookSecret({
    NODE_ENV: "development",
    ALLOW_STRIPE_DEMO_WEBHOOK_SECRET: "1",
  });
  assert(
    hatchAllow.ok === true &&
      hatchAllow.source === "demo_escape_hatch" &&
      hatchAllow.secret === STRIPE_DEMO_WEBHOOK_SECRET,
    "ALLOW_STRIPE_DEMO_WEBHOOK_SECRET=1 → demo secret allowed",
  );

  const nodeEnvTest = resolveStripeWebhookSecret({
    NODE_ENV: "test",
  });
  assert(
    nodeEnvTest.ok === true && nodeEnvTest.source === "demo_escape_hatch",
    "NODE_ENV=test → demo secret allowed",
  );

  const realSecret = "whsec_live_gridiron_audit_fixture_not_a_real_key";
  const envOk = resolveStripeWebhookSecret({
    NODE_ENV: "production",
    STRIPE_WEBHOOK_SECRET: realSecret,
  });
  assert(
    envOk.ok === true && envOk.source === "env" && envOk.secret === realSecret,
    "Real STRIPE_WEBHOOK_SECRET → accepted",
  );

  // --- verifyStripeSignature still works with real secret ---
  const body = JSON.stringify({ id: "evt_test", type: "ping" });
  const ts = "1700000000";
  const v1 = crypto.createHmac("sha256", realSecret).update(`${ts}.${body}`).digest("hex");
  assert(
    verifyStripeSignature(Buffer.from(body), `t=${ts},v1=${v1}`, realSecret) === true,
    "HMAC verify succeeds with real secret",
  );
  assert(
    verifyStripeSignature(Buffer.from(body), `t=${ts},v1=deadbeef`, realSecret) === false,
    "HMAC verify rejects forged signature",
  );

  // --- Express middleware verifyStripeWebhook ---
  function mockRes(): {
    res: Response;
    getStatus: () => number;
    getBody: () => unknown;
  } {
    let statusCode = 200;
    let responseBody: unknown = null;
    const res = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      json(data: unknown) {
        responseBody = data;
        return res;
      },
      send(data: unknown) {
        responseBody = data;
        return res;
      },
    } as unknown as Response;
    return { res, getStatus: () => statusCode, getBody: () => responseBody };
  }

  const prevSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const prevAllow = process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET;
  const prevNode = process.env.NODE_ENV;

  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET;
  process.env.NODE_ENV = "development";

  {
    const { res, getStatus, getBody } = mockRes();
    const gate = { next: false };
    verifyStripeWebhook({ headers: {}, body: {} } as Request, res, (() => {
      gate.next = true;
    }) as NextFunction);
    const bodyJson = getBody() as { error?: string };
    assert(
      getStatus() === 503 &&
        bodyJson?.error === "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED" &&
        gate.next === false,
      "Middleware: missing secret → 503, next not called",
    );
  }

  process.env.STRIPE_WEBHOOK_SECRET = realSecret;
  {
    const payload = JSON.stringify({ id: "evt_mw", type: "transfer.created" });
    const expected = crypto.createHmac("sha256", realSecret).update(payload).digest("hex");
    const { res, getStatus } = mockRes();
    const gate = { next: false };
    const req = {
      headers: { "stripe-signature": `t=1,v1=${expected}` },
      body: JSON.parse(payload),
      stripeVerified: false as boolean,
    } as unknown as Request & { stripeVerified?: boolean };
    verifyStripeWebhook(req, res, (() => {
      gate.next = true;
    }) as NextFunction);
    assert(
      gate.next === true && getStatus() === 200 && req.stripeVerified === true,
      "Middleware: valid HMAC with real secret → next()",
    );
  }

  if (prevSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = prevSecret;
  if (prevAllow === undefined) delete process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET;
  else process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET = prevAllow;
  if (prevNode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prevNode;

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (sync statements)`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

/** Async handler cases — run after sync asserts via top-level await pattern. */
async function runAsyncHandlerCases(): Promise<void> {
  console.log("--- async handleStripeWebhook cases ---");
  let passed = 0;
  let failed = 0;
  function assert(condition: boolean, name: string): void {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed += 1;
    } else {
      console.error(`  FAIL: ${name}`);
      failed += 1;
    }
  }

  const prevSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const prevAllow = process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET;
  const prevNode = process.env.NODE_ENV;

  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET;
  process.env.NODE_ENV = "development";

  let statusCode = 0;
  let responseBody: unknown = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      responseBody = data;
      return res;
    },
    send(data: unknown) {
      responseBody = data;
      return res;
    },
  } as unknown as Response;

  await handleStripeWebhook(
    { headers: { "stripe-signature": "t=1,v1=x" }, body: Buffer.from("{}") } as unknown as Request,
    res,
  );
  assert(
    statusCode === 503 &&
      (responseBody as { error?: string })?.error === "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED",
    "handleStripeWebhook: missing secret → 503",
  );

  process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET = "1";
  process.env.STRIPE_WEBHOOK_SECRET = STRIPE_DEMO_WEBHOOK_SECRET;
  const rawPayload = JSON.stringify({
    id: "evt_ok",
    type: "payment_intent.succeeded",
    data: { object: { amount: 10000, metadata: { campaignId: "cmp_x" } } },
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sig = crypto
    .createHmac("sha256", STRIPE_DEMO_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawPayload}`)
    .digest("hex");
  statusCode = 0;
  responseBody = null;
  await handleStripeWebhook(
    {
      headers: { "stripe-signature": `t=${timestamp},v1=${sig}` },
      body: Buffer.from(rawPayload),
    } as unknown as Request,
    res,
  );
  assert(
    statusCode === 200 && (responseBody as { status?: string })?.status === "FUNDED",
    "handleStripeWebhook: hatch + valid HMAC → 200 FUNDED",
  );

  if (prevSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = prevSecret;
  if (prevAllow === undefined) delete process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET;
  else process.env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET = prevAllow;
  if (prevNode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prevNode;

  console.log(`ASYNC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runStripeWebhookSecretTestSuite();
void runAsyncHandlerCases().then(() => {
  console.log("🟢 Stripe webhook secret suite complete.");
});

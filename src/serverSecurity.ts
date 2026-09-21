import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { verifyStripeSignature } from "./stripe-webhook-verification";
import { canRunAdminIngest, verifySupabaseAccessToken } from "./lib/supabaseUserAuth";

const IS_PROD = process.env.NODE_ENV === "production";

/** Timing-safe string compare for secrets. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function sanitizeErrorMessage(err: unknown, fallback: string): string {
  if (IS_PROD) return fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export type GatewayAuthVia = "api_token" | "supabase_jwt" | "dev_open";

export interface GatewayAuthContext {
  via: GatewayAuthVia;
  /** Supabase auth user id when `via` is `supabase_jwt`. */
  userId: string | null;
  /** Raw bearer token when the caller presented one. */
  accessToken: string | null;
}

export type GatewayAuthedRequest = Request & { gatewayAuth?: GatewayAuthContext };

/**
 * Browser and operator share one gate:
 * - `API_ACCESS_TOKEN` (server-to-server) OR
 * - a Supabase user access token (`auth.getUser`).
 * The SPA must send the user JWT. The operator token is never embedded in the Vite bundle.
 * Development with neither secret configured stays open and stamps `dev_open`.
 */
export function requireApiAuth(req: Request, res: Response, next: NextFunction): void {
  void authorizeRequest(req, res, next).catch((err: unknown) => {
    console.error("[Security] auth middleware failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "AUTH_FAILED", message: "Authorization check failed." });
    }
  });
}

async function authorizeRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  const configured = process.env.API_ACCESS_TOKEN?.trim();
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (configured && token && safeEqual(token, configured)) {
    (req as GatewayAuthedRequest).gatewayAuth = {
      via: "api_token",
      userId: null,
      accessToken: token,
    };
    next();
    return;
  }

  if (token) {
    const user = await verifySupabaseAccessToken(token);
    if (user) {
      if (req.path.startsWith("/v1/admin/") && !canRunAdminIngest(user)) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Admin ingest requires a compliance officer or head coach session.",
        });
        return;
      }
      (req as GatewayAuthedRequest).gatewayAuth = {
        via: "supabase_jwt",
        userId: user.id,
        accessToken: token,
      };
      next();
      return;
    }
  }

  if (!configured && !IS_PROD) {
    if (!(globalThis as { __ggAuthWarn?: boolean }).__ggAuthWarn) {
      console.warn(
        "[Security] API_ACCESS_TOKEN unset — API routes are open in development. Set a token before deploy.",
      );
      (globalThis as { __ggAuthWarn?: boolean }).__ggAuthWarn = true;
    }
    (req as GatewayAuthedRequest).gatewayAuth = {
      via: "dev_open",
      userId: null,
      accessToken: token || null,
    };
    next();
    return;
  }

  if (!configured && IS_PROD) {
    res.status(503).json({
      error: "AUTH_NOT_CONFIGURED",
      message: "API_ACCESS_TOKEN must be set in production.",
    });
    return;
  }

  res.status(401).json({ error: "UNAUTHORIZED", message: "Missing or invalid Bearer token." });
}

/** True when the upgrade token is the operator secret or a live Supabase user JWT. */
export async function isGatewayBearerAllowed(token: string): Promise<boolean> {
  const configured = process.env.API_ACCESS_TOKEN?.trim();
  if (configured && token && safeEqual(token, configured)) return true;
  if (!token) return false;
  const user = await verifySupabaseAccessToken(token);
  return user !== null;
}

/** Shared-secret header auth for ingress webhooks (Catapult / device vendors). */
export function requireWebhookSecret(headerName: string, envVar: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const expected = process.env[envVar]?.trim();
    if (!expected) {
      if (IS_PROD) {
        res.status(503).json({
          error: "WEBHOOK_SECRET_NOT_CONFIGURED",
          message: `${envVar} must be set in production.`,
        });
        return;
      }
      console.warn(`[Security] ${envVar} unset — webhook ${req.path} is open in development.`);
      next();
      return;
    }

    const rawHeader = req.headers[headerName.toLowerCase()];
    const provided = String(Array.isArray(rawHeader) ? rawHeader[0] : rawHeader || "").trim();
    if (!provided || !safeEqual(provided, expected)) {
      res.status(401).json({ error: "WEBHOOK_UNAUTHORIZED", message: "Invalid webhook secret." });
      return;
    }

    next();
  };
}

/**
 * Stripe signature check over the raw request body.
 * Mount `express.raw({ type: "application/json" })` on the webhook route and
 * keep that route out of `express.json()`. HMAC of `JSON.stringify(req.body)`
 * is not a valid Stripe signature and is not used here.
 */
export function verifyStripeWebhook(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = String(req.headers["stripe-signature"] || "").trim();

  if (!secret) {
    if (IS_PROD) {
      res.status(503).json({
        error: "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED",
        message: "STRIPE_WEBHOOK_SECRET must be set in production.",
      });
      return;
    }
    console.warn("[Security] STRIPE_WEBHOOK_SECRET unset — Stripe webhook open in development.");
    (req as Request & { stripeVerified?: boolean }).stripeVerified = false;
    next();
    return;
  }

  if (!signature) {
    res.status(401).json({
      error: "STRIPE_SIGNATURE_MISSING",
      message: "Stripe-Signature header required.",
    });
    return;
  }

  if (!Buffer.isBuffer(req.body)) {
    res.status(400).json({
      error: "STRIPE_RAW_BODY_REQUIRED",
      message: "Stripe webhook body must be the raw buffer. Parsed JSON cannot be re-signed.",
    });
    return;
  }

  if (!verifyStripeSignature(req.body, signature, secret)) {
    res.status(401).json({
      error: "STRIPE_SIGNATURE_INVALID",
      message: "Webhook signature verification failed.",
    });
    return;
  }

  (req as Request & { stripeVerified?: boolean }).stripeVerified = true;
  next();
}

/** Simple fixed-window rate limiter keyed by IP + route. */
export function createRateLimiter(options: { windowMs: number; max: number; name: string }) {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${options.name}:${req.ip || "unknown"}`;
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const recent = (hits.get(key) || []).filter((t) => t > windowStart);

    if (recent.length >= options.max) {
      res.status(429).json({
        error: "RATE_LIMITED",
        message: "Too many requests. Try again shortly.",
      });
      return;
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

export const ALLOWED_CONTACT_METHODS = ["written", "electronic", "call", "in_person"] as const;
export type ContactMethod = (typeof ALLOWED_CONTACT_METHODS)[number];

export function isContactMethod(value: unknown): value is ContactMethod {
  return typeof value === "string" && (ALLOWED_CONTACT_METHODS as readonly string[]).includes(value);
}

export function clampMessageText(text: unknown, maxLen = 4000): string | undefined {
  if (text == null) return undefined;
  if (typeof text !== "string") return undefined;
  return text.slice(0, maxLen);
}

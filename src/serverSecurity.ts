import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

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

/** Require Bearer API token when API_ACCESS_TOKEN is configured (always required in production). */
export function requireApiAuth(req: Request, res: Response, next: NextFunction): void {
  const configured = process.env.API_ACCESS_TOKEN?.trim();

  if (!configured) {
    if (IS_PROD) {
      res.status(503).json({
        error: "AUTH_NOT_CONFIGURED",
        message: "API_ACCESS_TOKEN must be set in production.",
      });
      return;
    }
    // Dev convenience: open APIs with a loud warning once per process
    if (!(globalThis as { __ggAuthWarn?: boolean }).__ggAuthWarn) {
      console.warn(
        "[Security] API_ACCESS_TOKEN unset — API routes are open in development. Set a token before deploy."
      );
      (globalThis as { __ggAuthWarn?: boolean }).__ggAuthWarn = true;
    }
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Missing Bearer token." });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!safeEqual(token, configured)) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid API token." });
    return;
  }

  next();
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
 * Mock Stripe signature verification.
 * Production must use stripe.webhooks.constructEvent with the raw body.
 * Here we require Stripe-Signature presence + matching STRIPE_WEBHOOK_SECRET prefix check.
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

  // Lightweight HMAC over stable JSON body using the configured secret (demo stand-in).
  const payload = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const provided = signature.includes("v1=")
    ? signature.split("v1=")[1]?.split(",")[0]?.trim() || ""
    : signature;

  if (!provided || !safeEqual(provided, expected)) {
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

/**
 * RallySafe Stripe webhook secret resolution — fail-closed by default.
 *
 * Demo secret `whsec_mock_*` is NEVER an accidental default. It is only used when
 * an explicit escape hatch is set (`ALLOW_STRIPE_DEMO_WEBHOOK_SECRET=1` or
 * `NODE_ENV=test`). Setting `STRIPE_WEBHOOK_SECRET` to the known demo string
 * without the hatch is also rejected (prevents "prod with demo secret").
 */

export const STRIPE_DEMO_WEBHOOK_SECRET = "whsec_mock_gridiron_gateway_secret_2026";

export type StripeWebhookSecretSource = "env" | "demo_escape_hatch";

export type StripeWebhookSecretOk = {
  ok: true;
  secret: string;
  source: StripeWebhookSecretSource;
};

export type StripeWebhookSecretErr = {
  ok: false;
  error: "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED" | "STRIPE_DEMO_SECRET_NOT_ALLOWED";
  message: string;
};

export type StripeWebhookSecretResolution = StripeWebhookSecretOk | StripeWebhookSecretErr;

export type StripeWebhookSecretEnv = {
  STRIPE_WEBHOOK_SECRET?: string;
  ALLOW_STRIPE_DEMO_WEBHOOK_SECRET?: string;
  NODE_ENV?: string;
};

/** Explicit local/test hatch — never inferred from bare `development`. */
export function isStripeDemoWebhookEscapeHatchEnabled(
  env: StripeWebhookSecretEnv = process.env,
): boolean {
  if (env.ALLOW_STRIPE_DEMO_WEBHOOK_SECRET?.trim() === "1") return true;
  if (env.NODE_ENV?.trim() === "test") return true;
  return false;
}

export function resolveStripeWebhookSecret(
  env: StripeWebhookSecretEnv = process.env,
): StripeWebhookSecretResolution {
  const configured = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  const hatch = isStripeDemoWebhookEscapeHatchEnabled(env);

  if (configured.length > 0) {
    if (configured === STRIPE_DEMO_WEBHOOK_SECRET && !hatch) {
      return {
        ok: false,
        error: "STRIPE_DEMO_SECRET_NOT_ALLOWED",
        message:
          "STRIPE_WEBHOOK_SECRET is the known demo value. Set ALLOW_STRIPE_DEMO_WEBHOOK_SECRET=1 or NODE_ENV=test for local demos, or use a real Stripe whsec_ secret.",
      };
    }
    return { ok: true, secret: configured, source: "env" };
  }

  if (hatch) {
    return {
      ok: true,
      secret: STRIPE_DEMO_WEBHOOK_SECRET,
      source: "demo_escape_hatch",
    };
  }

  return {
    ok: false,
    error: "STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED",
    message:
      "STRIPE_WEBHOOK_SECRET must be set. Demo fallback requires ALLOW_STRIPE_DEMO_WEBHOOK_SECRET=1 or NODE_ENV=test.",
  };
}

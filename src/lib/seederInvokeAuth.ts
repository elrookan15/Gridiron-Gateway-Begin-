/**
 * Fail-closed authz for CFBD → schools seeder ingress.
 * `SEEDER_INVOKE_SECRET` is mandatory: the SPA anon JWT is a valid gateway
 * token when `verify_jwt = true`, so an optional header would let anyone
 * overwrite `public.schools` via the Edge Function's service_role client.
 */
export type SeederInvokeDecision =
  | { ok: true }
  | { ok: false; httpStatus: 401 | 503; error: string };

export function evaluateSeederInvokeAuth(
  requiredSecret: string | null | undefined,
  providedSecret: string | null | undefined,
): SeederInvokeDecision {
  const required = requiredSecret?.trim() ?? "";
  if (!required) {
    return {
      ok: false,
      httpStatus: 503,
      error: "SEEDER_INVOKE_SECRET is not configured. Seeder is fail-closed.",
    };
  }

  const provided = providedSecret?.trim() ?? "";
  if (!provided || provided.length !== required.length) {
    return { ok: false, httpStatus: 401, error: "Unauthorized seeder invoke." };
  }

  let mismatch = 0;
  for (let i = 0; i < required.length; i += 1) {
    mismatch |= required.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return { ok: false, httpStatus: 401, error: "Unauthorized seeder invoke." };
  }

  return { ok: true };
}

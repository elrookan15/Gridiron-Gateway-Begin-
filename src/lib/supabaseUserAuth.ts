/**
 * Server-side Supabase access-token check.
 * Uses the anon key plus `auth.getUser(jwt)` — never the service role.
 */
import { createClient } from "@supabase/supabase-js";

export interface SupabaseSessionUser {
  id: string;
  appMetadata: Record<string, unknown>;
}

export type SupabaseUserVerifier = (accessToken: string) => Promise<SupabaseSessionUser | null>;

let verifier: SupabaseUserVerifier = verifyWithSupabaseAuth;

/** Test seam. Production code paths use `auth.getUser`. */
export function setSupabaseUserVerifier(next: SupabaseUserVerifier | null): void {
  verifier = next ?? verifyWithSupabaseAuth;
}

export async function verifySupabaseAccessToken(
  accessToken: string,
): Promise<SupabaseSessionUser | null> {
  const token = accessToken.trim();
  if (!token) return null;
  return verifier(token);
}

async function verifyWithSupabaseAuth(accessToken: string): Promise<SupabaseSessionUser | null> {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim();
  const anon = (process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!url || !anon) return null;

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user?.id) return null;
  const appMetadata =
    data.user.app_metadata && typeof data.user.app_metadata === "object"
      ? (data.user.app_metadata as Record<string, unknown>)
      : {};
  return { id: data.user.id, appMetadata };
}

const ADMIN_INGEST_ROLES = new Set(["HEAD_COACH_GM", "COMPLIANCE_OFFICER", "HEAD_COACH", "GM", "COMPLIANCE"]);

/** Operator ingest (CFBD, Sidearm, CSV) is not available to athlete sessions. */
export function canRunAdminIngest(user: SupabaseSessionUser): boolean {
  const raw = user.appMetadata.gateway_role ?? user.appMetadata.role_tier;
  if (typeof raw !== "string") return false;
  return ADMIN_INGEST_ROLES.has(raw.trim().toUpperCase());
}

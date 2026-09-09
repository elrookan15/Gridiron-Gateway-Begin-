/**
 * Server-only Supabase service-role client.
 * Never import from the Vite SPA bundle.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null | undefined;

export function getServiceRoleClient(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;

  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    adminClient = null;
    return null;
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function isServiceRoleConfigured(): boolean {
  return getServiceRoleClient() !== null;
}

export interface PersistResult {
  ok: boolean;
  upserted: number;
  error?: string;
}

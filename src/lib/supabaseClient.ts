/**
 * Browser Supabase client — publishable/anon key only.
 * Never import SUPABASE_SERVICE_ROLE_KEY into the Vite SPA.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim());
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
    );
  }

  if (!client) {
    client = createClient(supabaseUrl!.trim(), supabaseAnonKey!.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}

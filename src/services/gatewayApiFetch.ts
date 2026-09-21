/**
 * SPA fetch for Express `/api/*` routes.
 *
 * Auth model: the browser sends the signed-in Supabase access token.
 * `API_ACCESS_TOKEN` stays a server-to-server secret and is not read from `VITE_*`.
 * Webhooks keep their own shared secrets and must not use this helper.
 */
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";

export async function getGatewayAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await getSupabaseClient().auth.getSession();
  const token = data.session?.access_token?.trim();
  return token || null;
}

export async function gatewayApiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Authorization")) {
    const token = await getGatewayAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return fetch(input, { ...init, headers });
}

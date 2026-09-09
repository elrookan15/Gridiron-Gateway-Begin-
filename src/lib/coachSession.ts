/**
 * Resolve coach-scoped school id from Supabase JWT claims.
 * Prefer app_metadata.school_id (server-set); fall back to user_metadata.school_id.
 * Never invent a demo school for product pipeline queries.
 */
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

function schoolIdFromUser(user: User | null | undefined): string | null {
  if (!user) return null;
  const appId = user.app_metadata?.school_id;
  const userId = user.user_metadata?.school_id;
  if (typeof appId === "string" && appId.trim()) return appId.trim();
  if (typeof userId === "string" && userId.trim()) return userId.trim();
  return null;
}

export async function resolveCoachSchoolIdFromSession(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) return null;
  return schoolIdFromUser(data.session.user);
}

export function resolveCoachSchoolIdFromUser(user: User | null | undefined): string | null {
  return schoolIdFromUser(user);
}

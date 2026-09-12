/**
 * Resolve coach-scoped school id from Supabase JWT claims.
 * Authorization source: app_metadata.school_id only (server-set).
 * user_metadata is client-editable — never trust for tenant binding.
 */
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

function schoolIdFromUser(user: User | null | undefined): string | null {
  if (!user) return null;
  const appId = user.app_metadata?.school_id;
  if (typeof appId === "string" && appId.trim()) return appId.trim();
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

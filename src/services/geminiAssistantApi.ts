import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import type { PitchTone } from "../types";

export interface GeminiOutreachRequest {
  athleteName: string;
  position: string;
  starRating: number;
  originState: string;
  tone: PitchTone;
  coachName: string;
  programName: string;
}

export interface GeminiOutreachResponse {
  draft: string;
}

/**
 * Invokes `gemini-assistant` with the user JWT. The Gemini key never enters the SPA.
 */
export async function generateRecruitingOutreachDraft(
  payload: GeminiOutreachRequest,
): Promise<GeminiOutreachResponse> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cannot invoke gemini-assistant.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<GeminiOutreachResponse>("gemini-assistant", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.draft?.trim()) {
    throw new Error("Empty draft from gemini-assistant.");
  }
  return { draft: data.draft.trim() };
}

/**
 * Gridiron Gateway — Client-side Supabase client singleton & Postgres schema mappers.
 * Vite SPA Environment: VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DivisionTier, SchoolEntry } from "../types";

/** Postgres `public.schools` database row layout (snake_case). */
export interface DatabaseSchool {
  id: string;
  name: string;
  mascot: string | null;
  city: string;
  state: string;
  division: string;
  conference: string;
  primary_recruiting_email: string | null;
  coaching_phone: string | null;
  top_majors: string[] | null;
  program_highlights: string[] | null;
}

const getEnvVar = (key: string): string | undefined => {
  const viteValue =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env as ImportMetaEnv)[key as keyof ImportMetaEnv]
      : undefined;
  if (typeof viteValue === "string" && viteValue.length > 0) {
    return viteValue;
  }
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL")?.trim();
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY")?.trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Throws a descriptive runtime error during development if Supabase keys are missing. */
function validateEnvironment(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Gridiron Gateway] Missing Supabase environment variables! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env / .env.local file.",
    );
  }
}

function createBrowserClient(): SupabaseClient {
  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "public-anon-key-placeholder",
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      },
    },
  );
}

/** Singleton Supabase client instance used across the application. */
export const supabase: SupabaseClient = createBrowserClient();

/**
 * Returns the validated Supabase client.
 * Throws if environment variables are unconfigured.
 */
export function getSupabaseClient(): SupabaseClient {
  validateEnvironment();
  return supabase;
}

/**
 * Translates a snake_case Postgres `schools` row into a clean, camelCase `SchoolEntry` model.
 * Handles null/undefined array properties defensively to eliminate rendering crashes.
 */
export function mapDatabaseSchoolToSchoolEntry(
  dbSchool: DatabaseSchool,
): SchoolEntry {
  const divisionTier = (dbSchool.division || "FBS_P4") as DivisionTier;

  return {
    id: dbSchool.id,
    name: dbSchool.name,
    mascot: dbSchool.mascot ?? undefined,
    city: dbSchool.city,
    state: dbSchool.state,
    division: divisionTier,
    conference: dbSchool.conference,
    primaryRecruitingEmail: dbSchool.primary_recruiting_email ?? undefined,
    coachingPhone: dbSchool.coaching_phone ?? undefined,
    topMajors: Array.isArray(dbSchool.top_majors)
      ? [...dbSchool.top_majors]
      : undefined,
    programHighlights: Array.isArray(dbSchool.program_highlights)
      ? [...dbSchool.program_highlights]
      : undefined,
  };
}

/**
 * Translates a frontend camelCase `SchoolEntry` model into a snake_case Postgres `schools` row
 * suitable for database writeback operations.
 */
export function mapSchoolEntryToDatabaseSchool(
  entry: SchoolEntry,
): DatabaseSchool {
  return {
    id: entry.id,
    name: entry.name,
    mascot: entry.mascot ?? null,
    city: entry.city,
    state: entry.state,
    division: entry.division,
    conference: entry.conference,
    primary_recruiting_email: entry.primaryRecruitingEmail ?? null,
    coaching_phone: entry.coachingPhone ?? null,
    top_majors: entry.topMajors ? [...entry.topMajors] : null,
    program_highlights: entry.programHighlights
      ? [...entry.programHighlights]
      : null,
  };
}

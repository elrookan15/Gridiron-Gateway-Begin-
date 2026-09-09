/**
 * Gridiron Gateway — Client-side Supabase client singleton.
 * Vite SPA Environment: VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.
 *
 * School/coach row mappers live in `src/lib/directoryMappers.ts` + `src/services/schoolsApi.ts`
 * against production `DatabaseSchool` / `DatabaseCoach` in `src/types.ts`.
 * Do not reintroduce MVP UUID `schools(id, name, …)` shapes here.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

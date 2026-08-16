import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (request: any, response?: any) => {
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies ? request.cookies.getAll() : [];
        },
        setAll(cookiesToSet) {
          if (request.cookies && typeof request.cookies.set === 'function') {
            cookiesToSet.forEach(({ name, value }: any) => request.cookies.set(name, value));
          }
          if (response && response.cookies && typeof response.cookies.set === 'function') {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              response.cookies.set(name, value, options)
            );
          }
        },
      },
    },
  );

  return supabase;
};

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database.types";

/**
 * Request-scoped Supabase client for Server Components, Server Actions,
 * and Route Handlers. Uses the anon key and the caller's session cookies —
 * all access is subject to RLS. Create a fresh instance per request; do
 * not cache or share across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no response to write to.
            // Safe to ignore because `src/proxy.ts` refreshes the session
            // on every request.
          }
        },
      },
    },
  );
}

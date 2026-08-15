import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely.
 *
 * Only import this inside `src/server/services/*` modules that perform
 * their own explicit authorization checks before using it — never from
 * components, Server Actions, or Route Handlers directly, and never for
 * a request path that just needs the caller's own RLS-scoped access.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

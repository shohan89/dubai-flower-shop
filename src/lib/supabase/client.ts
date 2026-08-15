import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database.types";

/**
 * Browser Supabase client for use inside Client Components.
 * Uses the publishable key only — all access is subject to RLS.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Plain insert, not upsert: the RLS policy only grants anon/authenticated
 * INSERT (see supabase/migrations/*_newsletter_subscribers.sql) — an
 * upsert's ON CONFLICT DO UPDATE path would need an UPDATE policy too.
 * An existing subscriber re-submitting just hits the unique constraint,
 * which we treat as success rather than surfacing an error.
 */
export async function subscribeToNewsletter(
  supabase: SupabaseClient<Database>,
  email: string,
): Promise<void> {
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error && error.code !== "23505") throw error;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export async function listEnabledHomepageSections(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_enabled", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

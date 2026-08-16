import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type SeoRow = Database["public"]["Tables"]["seo_metadata"]["Row"];
type SeoUpsertInput = Omit<
  Database["public"]["Tables"]["seo_metadata"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

export async function getSeoMetadata(
  supabase: SupabaseClient<Database>,
  entityType: string,
  entityId: string,
): Promise<SeoRow | null> {
  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Insert-or-update by (entity_type, entity_id) — no native upsert target column pair issue since that's a real unique index. */
export async function upsertSeoMetadata(
  supabase: SupabaseClient<Database>,
  input: SeoUpsertInput,
): Promise<SeoRow> {
  const { data, error } = await supabase
    .from("seo_metadata")
    .upsert(input, { onConflict: "entity_type,entity_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

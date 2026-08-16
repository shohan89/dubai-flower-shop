import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type AddonRow = Database["public"]["Tables"]["addons"]["Row"];
type AddonInsert = Database["public"]["Tables"]["addons"]["Insert"];
type AddonUpdate = Database["public"]["Tables"]["addons"]["Update"];

export async function listAllAddons(supabase: SupabaseClient<Database>): Promise<AddonRow[]> {
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAddonById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<AddonRow | null> {
  const { data, error } = await supabase.from("addons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createAddon(
  supabase: SupabaseClient<Database>,
  input: AddonInsert,
): Promise<AddonRow> {
  const { data, error } = await supabase.from("addons").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateAddon(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: AddonUpdate,
): Promise<AddonRow> {
  const { data, error } = await supabase
    .from("addons")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteAddon(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("addons")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);
  if (error) throw error;
}

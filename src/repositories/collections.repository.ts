import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];
type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];
type CollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

export async function listAllCollections(
  supabase: SupabaseClient<Database>,
): Promise<CollectionRow[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listCollectionsPaginated(
  supabase: SupabaseClient<Database>,
  { search, page, pageSize }: { search?: string; page: number; pageSize: number },
): Promise<{ rows: CollectionRow[]; totalCount: number }> {
  let query = supabase
    .from("collections")
    .select("*", { count: "exact" })
    .is("deleted_at", null);
  if (search) query = query.ilike("name", `%${search}%`);
  query = query.order("display_order", { ascending: true });
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getCollectionById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<CollectionRow | null> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCollection(
  supabase: SupabaseClient<Database>,
  input: CollectionInsert,
): Promise<CollectionRow> {
  const { data, error } = await supabase.from("collections").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCollection(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: CollectionUpdate,
): Promise<CollectionRow> {
  const { data, error } = await supabase
    .from("collections")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteCollection(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("collections")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);
  if (error) throw error;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function listAllCategories(
  supabase: SupabaseClient<Database>,
): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listCategoriesPaginated(
  supabase: SupabaseClient<Database>,
  { search, page, pageSize }: { search?: string; page: number; pageSize: number },
): Promise<{ rows: CategoryRow[]; totalCount: number }> {
  let query = supabase
    .from("categories")
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

export async function getCategoryById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<CategoryRow | null> {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCategory(
  supabase: SupabaseClient<Database>,
  input: CategoryInsert,
): Promise<CategoryRow> {
  const { data, error } = await supabase.from("categories").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: CategoryUpdate,
): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteCategory(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);
  if (error) throw error;
}

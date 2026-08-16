import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductListFilters = {
  search?: string;
  status?: string;
  productType?: string;
  page: number;
  pageSize: number;
  sortKey?: string;
  sortDir: "asc" | "desc";
};

const SORTABLE_COLUMNS = new Set(["name", "base_price", "stock_quantity", "status", "updated_at"]);

export async function listProducts(
  supabase: SupabaseClient<Database>,
  filters: ProductListFilters,
): Promise<{ rows: ProductRow[]; totalCount: number }> {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`,
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.productType) query = query.eq("product_type", filters.productType);

  const sortColumn =
    filters.sortKey && SORTABLE_COLUMNS.has(filters.sortKey) ? filters.sortKey : "updated_at";
  query = query.order(sortColumn, { ascending: filters.sortDir === "asc" });

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getProductById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProductBySku(
  supabase: SupabaseClient<Database>,
  sku: string,
): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("sku", sku)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProduct(
  supabase: SupabaseClient<Database>,
  input: ProductInsert,
): Promise<ProductRow> {
  const { data, error } = await supabase.from("products").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: ProductUpdate,
): Promise<ProductRow> {
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveProduct(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("products").update({ status: "archived" }).eq("id", id);
  if (error) throw error;
}

export async function softDeleteProduct(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", id);
  if (error) throw error;
}

export async function countActiveProducts(supabase: SupabaseClient<Database>): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .is("deleted_at", null);
  if (error) throw error;
  return count ?? 0;
}

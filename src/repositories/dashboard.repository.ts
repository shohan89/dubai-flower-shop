import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Aggregate queries fetch raw rows and reduce in application code rather
 * than via SQL views/RPCs — simplest option at this data volume. Revisit
 * with dedicated aggregate views/RPCs if order volume grows large enough
 * for this to matter.
 */

export async function getSalesTotals(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("orders")
    .select("total, placed_at, payment_status")
    .eq("payment_status", "paid");
  if (error) throw error;
  return data ?? [];
}

export async function getOrderStatusCounts(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("orders").select("status, placed_at");
  if (error) throw error;
  return data ?? [];
}

export async function getRecentOrders(supabase: SupabaseClient<Database>, limit: number) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("placed_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTopProducts(supabase: SupabaseClient<Database>, sinceIso: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("product_name_snapshot, quantity, line_subtotal, created_at")
    .gte("created_at", sinceIso);
  if (error) throw error;
  return data ?? [];
}

export async function countProducts(supabase: SupabaseClient<Database>): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);
  if (error) throw error;
  return count ?? 0;
}

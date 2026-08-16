import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export type OrderListFilters = {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page: number;
  pageSize: number;
  sortKey?: string;
  sortDir: "asc" | "desc";
};

const SORTABLE_COLUMNS = new Set(["order_number", "total", "status", "payment_status", "placed_at"]);

export async function listOrders(
  supabase: SupabaseClient<Database>,
  filters: OrderListFilters,
): Promise<{ rows: OrderRow[]; totalCount: number }> {
  let query = supabase.from("orders").select("*", { count: "exact" });

  if (filters.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`,
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);

  const sortColumn =
    filters.sortKey && SORTABLE_COLUMNS.has(filters.sortKey) ? filters.sortKey : "placed_at";
  query = query.order(sortColumn, { ascending: filters.sortDir === "asc" });

  const from = (filters.page - 1) * filters.pageSize;
  query = query.range(from, from + filters.pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getOrderById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<OrderRow | null> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrderItems(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderDelivery(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase
    .from("order_deliveries")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrderPayments(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderRefunds(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase
    .from("refunds")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderStatusHistory(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateOrder(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: OrderUpdate,
): Promise<OrderRow> {
  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderNotes(
  supabase: SupabaseClient<Database>,
  id: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase.from("orders").update({ order_notes: notes }).eq("id", id);
  if (error) throw error;
}

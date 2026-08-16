import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function listCustomers(
  supabase: SupabaseClient<Database>,
  { search, page, pageSize }: { search?: string; page: number; pageSize: number },
): Promise<{ rows: ProfileRow[]; totalCount: number }> {
  let query = supabase.from("profiles").select("*", { count: "exact" }).is("deleted_at", null);
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  query = query.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getCustomerById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCustomerAddresses(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCustomerOrders(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("placed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function countCustomers(supabase: SupabaseClient<Database>): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);
  if (error) throw error;
  return count ?? 0;
}

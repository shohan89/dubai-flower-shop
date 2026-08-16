import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];
type CouponInsert = Database["public"]["Tables"]["coupons"]["Insert"];
type CouponUpdate = Database["public"]["Tables"]["coupons"]["Update"];

export async function listCoupons(
  supabase: SupabaseClient<Database>,
  { search, page, pageSize }: { search?: string; page: number; pageSize: number },
): Promise<{ rows: CouponRow[]; totalCount: number }> {
  let query = supabase.from("coupons").select("*", { count: "exact" }).is("deleted_at", null);
  if (search) query = query.ilike("code", `%${search}%`);
  query = query.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getCouponById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<CouponRow | null> {
  const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCoupon(
  supabase: SupabaseClient<Database>,
  input: CouponInsert,
): Promise<CouponRow> {
  const { data, error } = await supabase.from("coupons").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateCoupon(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: CouponUpdate,
): Promise<CouponRow> {
  const { data, error } = await supabase
    .from("coupons")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteCoupon(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("coupons")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);
  if (error) throw error;
}

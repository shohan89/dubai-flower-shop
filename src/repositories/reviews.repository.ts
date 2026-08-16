import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export async function listReviews(
  supabase: SupabaseClient<Database>,
  { status, page, pageSize }: { status?: string; page: number; pageSize: number },
): Promise<{ rows: ReviewRow[]; totalCount: number }> {
  let query = supabase.from("reviews").select("*", { count: "exact" }).is("deleted_at", null);
  if (status) query = query.eq("status", status);
  query = query.order("created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], totalCount: count ?? 0 };
}

export async function getProductNamesByIds(
  supabase: SupabaseClient<Database>,
  ids: string[],
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("products").select("id, name").in("id", ids);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row.name]));
}

export async function setReviewStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: "approved" | "rejected",
): Promise<void> {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

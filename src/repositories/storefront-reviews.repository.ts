import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export async function listApprovedReviewsForProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getReviewSummaryForProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved")
    .is("deleted_at", null);
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return { average: 0, count: 0 };
  const average = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
  return { average, count: rows.length };
}

export async function insertReview(
  supabase: SupabaseClient<Database>,
  input: {
    productId: string;
    userId: string;
    authorName: string;
    rating: number;
    title?: string;
    body?: string;
  },
) {
  const { error } = await supabase.from("reviews").insert({
    product_id: input.productId,
    user_id: input.userId,
    author_name: input.authorName,
    rating: input.rating,
    title: input.title ?? null,
    body: input.body ?? null,
  });
  if (error) throw error;
}

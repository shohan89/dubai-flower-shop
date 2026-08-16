import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listReviews, getProductNamesByIds, setReviewStatus } from "@/repositories/reviews.repository";

export async function listReviewsForAdmin(params: {
  status?: string;
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();
  const { rows, totalCount } = await listReviews(supabase, params);
  const productNames = await getProductNamesByIds(
    supabase,
    Array.from(new Set(rows.map((r) => r.product_id))),
  );
  return {
    rows: rows.map((row) => ({ ...row, productName: productNames.get(row.product_id) ?? "Unknown" })),
    totalCount,
  };
}

export async function moderateReview(id: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  await setReviewStatus(supabase, id, status);
}

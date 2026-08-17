import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/services/authorization.service";
import { getProfileById } from "@/repositories/profile.repository";
import { insertReview } from "@/repositories/storefront-reviews.repository";
import { reviewSchema, type ReviewInput } from "@/validations/review.schema";

export async function submitProductReview(productId: string, raw: ReviewInput): Promise<void> {
  const input = reviewSchema.parse(raw);
  const { user } = await requireAuth();
  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);

  await insertReview(supabase, {
    productId,
    userId: user.id,
    authorName: profile?.full_name ?? user.email ?? "Anonymous",
    rating: input.rating,
    title: input.title,
    body: input.body,
  });
}

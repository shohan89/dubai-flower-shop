"use server";

import { revalidatePath } from "next/cache";
import { submitProductReview } from "@/services/storefront-review.service";
import { parseReviewFormData } from "@/validations/review.schema";

export type ReviewFormState = { error?: string; success?: boolean };

export async function submitReviewAction(
  productId: string,
  productSlug: string,
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const parsed = parseReviewFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await submitProductReview(productId, parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not submit review" };
  }

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}

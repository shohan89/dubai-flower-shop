import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listApprovedReviewsForProduct, getReviewSummaryForProduct } from "@/repositories/storefront-reviews.repository";
import { getCurrentUser } from "@/services/authorization.service";
import { ReviewForm } from "@/components/storefront/review-form";

export async function ProductReviews({ productId, productSlug }: { productId: string; productSlug: string }) {
  const supabase = await createClient();
  const [reviews, summary, context] = await Promise.all([
    listApprovedReviewsForProduct(supabase, productId),
    getReviewSummaryForProduct(supabase, productId),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 text-brand-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`size-4 ${i < Math.round(summary.average) ? "fill-brand-gold" : "opacity-30"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {summary.count > 0 ? `${summary.average.toFixed(1)} (${summary.count} review${summary.count === 1 ? "" : "s"})` : "No reviews yet"}
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 text-brand-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-3.5 ${i < review.rating ? "fill-brand-gold" : "opacity-30"}`} />
                  ))}
                </div>
                <p className="text-sm font-medium">{review.author_name}</p>
              </div>
              {review.title ? <p className="mt-1 text-sm font-medium">{review.title}</p> : null}
              {review.body ? <p className="mt-1 text-sm text-muted-foreground">{review.body}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {context ? (
        <ReviewForm productId={productId} productSlug={productSlug} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}
    </div>
  );
}

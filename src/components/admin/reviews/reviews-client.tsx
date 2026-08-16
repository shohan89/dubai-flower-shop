"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { reviewStatusTone } from "@/lib/admin/status-tones";
import { moderateReviewAction } from "@/app/admin/(dashboard)/reviews/actions";
import type { Database } from "@/types/database.types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"] & { productName: string };

export function ReviewsClient({ reviews }: { reviews: ReviewRow[] }) {
  const [isPending, startTransition] = useTransition();

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews found.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {review.author_name} — {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <p className="text-xs text-muted-foreground">{review.productName}</p>
              {review.title ? <p className="mt-1 text-sm font-medium">{review.title}</p> : null}
              {review.body ? <p className="mt-1 text-sm text-muted-foreground">{review.body}</p> : null}
            </div>
            <StatusBadge label={review.status} tone={reviewStatusTone(review.status)} />
          </div>
          {review.status === "pending" ? (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => startTransition(() => moderateReviewAction(review.id, "approved"))}
              >
                <Check className="size-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => startTransition(() => moderateReviewAction(review.id, "rejected"))}
              >
                <X className="size-4" />
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

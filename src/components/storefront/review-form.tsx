"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";
import { submitReviewAction } from "@/app/product/[slug]/actions";

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const boundAction = submitReviewAction.bind(null, productId, productSlug);
  const [state, formAction] = useActionState(boundAction, {});
  const [rating, setRating] = useState(5);

  if (state.success) {
    return (
      <p className="text-sm text-primary">
        Thanks for your review — it will appear once approved.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i + 1} stars`}
            onClick={() => setRating(i + 1)}
          >
            <Star className={`size-5 ${i < rating ? "fill-brand-gold text-brand-gold" : "text-muted-foreground"}`} />
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <Input name="title" placeholder="Review title (optional)" />
      <Textarea name="body" placeholder="Share your experience…" rows={3} />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton size="sm">Submit review</SubmitButton>
    </form>
  );
}

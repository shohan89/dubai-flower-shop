"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlistAction } from "@/app/wishlist/actions";

export function WishlistButton({
  productId,
  initialWishlisted,
  className,
}: {
  productId: string;
  initialWishlisted: boolean;
  className?: string;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleWishlistAction(productId);
          if (result.error) {
            const next = ("/login?next=" + encodeURIComponent(window.location.pathname)) as Route;
            router.push(next);
            return;
          }
          setWishlisted(Boolean(result.wishlisted));
        })
      }
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background",
        className,
      )}
    >
      <Heart
        className={cn("size-4 transition-colors", wishlisted ? "fill-brand-accent text-brand-accent" : "text-foreground")}
      />
    </button>
  );
}

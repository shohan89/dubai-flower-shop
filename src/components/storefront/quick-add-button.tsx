"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartDrawer } from "@/components/storefront/cart-drawer-context";
import { addToCartAction } from "@/app/cart/actions";

export function QuickAddButton({
  productId,
  className,
  fullWidth,
}: {
  productId: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const { open } = useCartDrawer();
  const router = useRouter();

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={isPending}
      className={className}
      style={fullWidth ? { width: "100%" } : undefined}
      onClick={() =>
        startTransition(async () => {
          const result = await addToCartAction({ productId, variantId: null, quantity: 1 });
          if (!result.error) {
            // revalidatePath (in the action) invalidates the cache but
            // doesn't re-render the already-mounted layout that feeds
            // <CartDrawer> its items — router.refresh() re-fetches the
            // current route's Server Components so the drawer shows the
            // item that was just added instead of stale (empty) props.
            router.refresh();
            setJustAdded(true);
            open();
            setTimeout(() => setJustAdded(false), 2000);
          }
        })
      }
    >
      {justAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
      {justAdded ? "Added" : "Add to bag"}
    </Button>
  );
}

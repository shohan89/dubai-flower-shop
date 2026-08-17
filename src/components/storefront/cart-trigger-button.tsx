"use client";

import { ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/components/storefront/cart-drawer-context";

export function CartTriggerButton({ itemCount }: { itemCount: number }) {
  const { open } = useCartDrawer();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-medium text-brand-text">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}

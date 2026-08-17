"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartDrawer } from "@/components/storefront/cart-drawer-context";
import { updateCartItemAction, removeCartItemAction } from "@/app/cart/actions";
import type { CartItemWithProduct } from "@/repositories/cart.repository";

export function CartDrawer({
  items,
  subtotal,
}: {
  items: CartItemWithProduct[];
  subtotal: number;
}) {
  const { isOpen, setOpen } = useCartDrawer();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function mutate(action: () => Promise<void>) {
    // Same reasoning as QuickAddButton: force the layout that supplies
    // `items`/`subtotal` to this drawer to re-fetch after a mutation.
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-heading text-lg">
            Your Bag {items.length > 0 ? `(${items.length})` : ""}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button
              onClick={() => setOpen(false)}
              nativeButton={false}
              render={<Link href="/shop">Start shopping</Link>}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.productImageUrl ? (
                      <SafeImage
                        src={item.productImageUrl}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                        fallbackClassName="size-full"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <button
                        type="button"
                        aria-label="Remove item"
                        disabled={isPending}
                        onClick={() => mutate(() => removeCartItemAction(item.id))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    {item.variantName ? (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    ) : null}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isPending}
                          onClick={() => mutate(() => updateCartItemAction(item.id, item.quantity - 1))}
                          className="flex size-6 items-center justify-center"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-4 text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={isPending}
                          onClick={() => mutate(() => updateCartItemAction(item.id, item.quantity + 1))}
                          className="flex size-6 items-center justify-center"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        AED {(Number(item.unit_price_snapshot) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">AED {subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery and taxes calculated at checkout.
              </p>
              <Button className="w-full" size="lg" disabled>
                Checkout (coming soon)
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

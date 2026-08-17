"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { useCartDrawer } from "@/components/storefront/cart-drawer-context";
import { addToCartAction } from "@/app/cart/actions";
import { formatAed } from "@/lib/storefront/pricing";
import type { Database } from "@/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type VariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
type AddonRow = Database["public"]["Tables"]["addons"]["Row"];

export function ProductPurchasePanel({
  product,
  variants,
  addons,
  isWishlisted,
}: {
  product: ProductRow;
  variants: VariantRow[];
  addons: { addon: AddonRow; isDefault: boolean }[];
  isWishlisted: boolean;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.find((v) => v.is_default)?.id ?? variants[0]?.id ?? null,
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(
    () => new Set(addons.filter((a) => a.isDefault).map((a) => a.addon.id)),
  );
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const { open } = useCartDrawer();
  const router = useRouter();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const unitPrice = selectedVariant?.price_override ?? product.base_price;
  const addonsTotal = addons
    .filter((a) => selectedAddonIds.has(a.addon.id))
    .reduce((sum, a) => sum + Number(a.addon.price), 0);
  const total = (Number(unitPrice) + addonsTotal) * quantity;

  const stockQuantity = selectedVariant?.stock_quantity ?? product.stock_quantity;
  const inStock = stockQuantity > 0;

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  }

  function handleAddToCart() {
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCartAction({
        productId: product.id,
        variantId: selectedVariantId,
        quantity,
        addonIds: Array.from(selectedAddonIds),
      });
      if (result.error) {
        setFeedback(result.error);
      } else {
        // See QuickAddButton for why this is needed: revalidatePath alone
        // doesn't re-render the already-mounted layout feeding the cart
        // drawer its data.
        router.refresh();
        open();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-foreground">{product.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xl font-medium">{formatAed(unitPrice)}</span>
          {product.compare_at_price ? (
            <span className="text-sm text-muted-foreground line-through">{formatAed(product.compare_at_price)}</span>
          ) : null}
        </div>
      </div>

      {product.short_description ? (
        <p className="text-sm text-muted-foreground">{product.short_description}</p>
      ) : null}

      {variants.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Options</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  variant.id === selectedVariantId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {addons.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Add a little extra</p>
          <div className="space-y-1.5">
            {addons.map(({ addon }) => (
              <label key={addon.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAddonIds.has(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                  />
                  {addon.name}
                </span>
                <span className="text-muted-foreground">+{formatAed(addon.price)}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">Quantity</p>
        <div className="inline-flex items-center gap-3 rounded-full border border-border px-2 py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-7 items-center justify-center"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="min-w-6 text-center text-sm">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-7 items-center justify-center"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="size-4 text-primary" />
          {product.delivery_available && inStock ? (
            <span className="font-medium text-primary">Available for delivery in Dubai</span>
          ) : (
            <span className="font-medium text-destructive">Currently unavailable</span>
          )}
        </div>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Preferred delivery date
          <input
            type="date"
            min={minDate}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="lg"
          className="flex-1"
          disabled={isPending || !inStock || !product.delivery_available}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="size-4" />
          {isPending ? "Adding…" : inStock ? `Add to bag — ${formatAed(total)}` : "Out of stock"}
        </Button>
        <WishlistButton
          productId={product.id}
          initialWishlisted={isWishlisted}
          className="size-11 border border-border bg-transparent hover:bg-muted"
        />
      </div>
      {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}
    </div>
  );
}

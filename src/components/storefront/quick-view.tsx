"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuickAddButton } from "@/components/storefront/quick-add-button";
import { formatAed, discountPercent } from "@/lib/storefront/pricing";
import type { ProductCardData } from "@/services/storefront-product.service";

export function QuickView({ product }: { product: ProductCardData }) {
  const [open, setOpen] = useState(false);
  const discount = discountPercent(product.base_price, product.compare_at_price);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Quick view"
            className="flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
          >
            <Eye className="size-4" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {product.imageUrl ? (
              <SafeImage src={product.imageUrl} alt={product.name} fill sizes="400px" className="object-cover" fallbackClassName="size-full" />
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-2xl text-foreground">{product.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{formatAed(product.base_price)}</span>
              {product.compare_at_price ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatAed(product.compare_at_price)}
                </span>
              ) : null}
              {discount ? (
                <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-medium text-[#8a3f2e]">
                  -{discount}%
                </span>
              ) : null}
            </div>
            {product.short_description ? (
              <p className="text-sm text-muted-foreground">{product.short_description}</p>
            ) : null}
            <div className="mt-auto flex flex-col gap-2">
              <QuickAddButton productId={product.id} fullWidth />
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={`/product/${product.slug}`} onClick={() => setOpen(false)}>
                    View full details
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

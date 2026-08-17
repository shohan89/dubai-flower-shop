import Link from "next/link";
import { ImageOff } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import { ProductBadges } from "@/components/storefront/product-badges";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { QuickView } from "@/components/storefront/quick-view";
import { QuickAddButton } from "@/components/storefront/quick-add-button";
import { formatAed } from "@/lib/storefront/pricing";
import type { ProductCardData } from "@/services/storefront-product.service";

export function ProductCard({
  product,
  isWishlisted,
}: {
  product: ProductCardData;
  isWishlisted: boolean;
}) {
  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        <Link href={`/product/${product.slug}`} className="block size-full">
          {product.imageUrl ? (
            <SafeImage
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackClassName="size-full"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" />
            </div>
          )}
        </Link>

        <ProductBadges product={product} />

        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <WishlistButton productId={product.id} initialWishlisted={isWishlisted} />
          <QuickView product={product} />
        </div>

        <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <QuickAddButton productId={product.id} fullWidth />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-heading text-base text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{formatAed(product.base_price)}</span>
          {product.compare_at_price ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatAed(product.compare_at_price)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

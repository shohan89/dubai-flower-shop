import { ProductCard } from "@/components/storefront/product-card";
import { getMyWishlistProductIds } from "@/services/wishlist.service";
import type { ProductCardData } from "@/services/storefront-product.service";

export async function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: {
  products: ProductCardData[];
  emptyMessage?: string;
}) {
  const wishlistIds = await getMyWishlistProductIds();

  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds?.has(product.id) ?? false}
        />
      ))}
    </div>
  );
}

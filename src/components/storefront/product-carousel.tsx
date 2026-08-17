import { ProductCard } from "@/components/storefront/product-card";
import { getMyWishlistProductIds } from "@/services/wishlist.service";
import type { ProductCardData } from "@/services/storefront-product.service";

/**
 * Horizontal scroll with CSS scroll-snap — no JS carousel library, works
 * natively with touch/trackpad, keeps this a Server Component.
 */
export async function ProductCarousel({ products }: { products: ProductCardData[] }) {
  const wishlistIds = await getMyWishlistProductIds();

  if (products.length === 0) return null;

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none]">
      {products.map((product) => (
        <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]">
          <ProductCard product={product} isWishlisted={wishlistIds?.has(product.id) ?? false} />
        </div>
      ))}
    </div>
  );
}

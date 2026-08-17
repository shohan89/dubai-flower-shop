import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";
import { StorefrontPagination } from "@/components/storefront/storefront-pagination";
import type { ListingSearchParams } from "@/lib/storefront/listing-params";
import type { ProductCardData } from "@/services/storefront-product.service";

const PAGE_SIZE = 24;

export function ProductListingResults({
  basePath,
  searchParams,
  page,
  products,
  totalCount,
  categories,
  occasions,
  flowerTypes,
  plantTypes,
}: {
  basePath: string;
  searchParams: ListingSearchParams;
  page: number;
  products: ProductCardData[];
  totalCount: number;
  categories?: { slug: string; name: string }[];
  occasions?: string[];
  flowerTypes?: string[];
  plantTypes?: string[];
}) {
  return (
    <div className="space-y-8">
      <ProductFilters
        basePath={basePath}
        searchParams={searchParams}
        categories={categories}
        occasions={occasions}
        flowerTypes={flowerTypes}
        plantTypes={plantTypes}
      />
      <p className="text-sm text-muted-foreground">{totalCount} products</p>
      <ProductGrid products={products} />
      <StorefrontPagination
        basePath={basePath}
        searchParams={searchParams}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
      />
    </div>
  );
}

export { PAGE_SIZE as PRODUCT_LISTING_PAGE_SIZE };

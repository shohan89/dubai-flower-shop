import type { Metadata } from "next";
import { listProductsForStorefront } from "@/services/storefront-product.service";
import { ProductListingResults, PRODUCT_LISTING_PAGE_SIZE } from "@/components/storefront/product-listing-results";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { parseListingFilters, type ListingSearchParams } from "@/lib/storefront/listing-params";

export const metadata: Metadata = {
  title: "Gifts",
  description: "Gift-ready arrangements and add-ons, delivered across Dubai.",
};

const BASE_PATH = "/gifts";
const PRODUCT_TYPES = ["gift"];

export default async function GiftsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const filters = parseListingFilters(params);

  const { rows, totalCount } = await listProductsForStorefront({
    ...filters,
    productTypes: PRODUCT_TYPES,
    page: filters.page,
    pageSize: PRODUCT_LISTING_PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: "Gifts" }]} />
      <h1 className="mb-8 font-heading text-3xl text-foreground">Gifts</h1>
      <ProductListingResults
        basePath={BASE_PATH}
        searchParams={params}
        page={filters.page}
        products={rows}
        totalCount={totalCount}
      />
    </div>
  );
}

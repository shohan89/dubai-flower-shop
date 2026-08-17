import type { Metadata } from "next";
import { listProductsForStorefront, getStorefrontFilterOptions } from "@/services/storefront-product.service";
import { ProductListingResults, PRODUCT_LISTING_PAGE_SIZE } from "@/components/storefront/product-listing-results";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { parseListingFilters, type ListingSearchParams } from "@/lib/storefront/listing-params";

export const metadata: Metadata = {
  title: "Plants",
  description: "Indoor and outdoor plants, delivered across Dubai.",
};

const BASE_PATH = "/plants";
const PRODUCT_TYPES = ["plant"];

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const filters = parseListingFilters(params);

  const [{ rows, totalCount }, filterOptions] = await Promise.all([
    listProductsForStorefront({
      ...filters,
      productTypes: PRODUCT_TYPES,
      page: filters.page,
      pageSize: PRODUCT_LISTING_PAGE_SIZE,
    }),
    getStorefrontFilterOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: "Plants" }]} />
      <h1 className="mb-8 font-heading text-3xl text-foreground">Plants</h1>
      <ProductListingResults
        basePath={BASE_PATH}
        searchParams={params}
        page={filters.page}
        products={rows}
        totalCount={totalCount}
        plantTypes={filterOptions.plantTypes}
      />
    </div>
  );
}

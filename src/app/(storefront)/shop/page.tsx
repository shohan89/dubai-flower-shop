import type { Metadata } from "next";
import { listProductsForStorefront, getStorefrontFilterOptions } from "@/services/storefront-product.service";
import { getAllCategoriesForPicker } from "@/services/category.service";
import { ProductListingResults, PRODUCT_LISTING_PAGE_SIZE } from "@/components/storefront/product-listing-results";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { parseListingFilters, type ListingSearchParams } from "@/lib/storefront/listing-params";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse fresh flowers, plants, and gifts delivered across Dubai.",
};

const BASE_PATH = "/shop";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const filters = parseListingFilters(params);

  const [{ rows, totalCount }, filterOptions, categories] = await Promise.all([
    listProductsForStorefront({ ...filters, page: filters.page, pageSize: PRODUCT_LISTING_PAGE_SIZE }),
    getStorefrontFilterOptions(),
    getAllCategoriesForPicker(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: "Shop" }]} />
      <h1 className="mb-8 font-heading text-3xl text-foreground">Shop All</h1>
      <ProductListingResults
        basePath={BASE_PATH}
        searchParams={params}
        page={filters.page}
        products={rows}
        totalCount={totalCount}
        categories={categories}
        occasions={filterOptions.occasions}
        flowerTypes={filterOptions.flowerTypes}
        plantTypes={filterOptions.plantTypes}
      />
    </div>
  );
}

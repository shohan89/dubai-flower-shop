import type { Metadata } from "next";
import { Search } from "lucide-react";
import { listProductsForStorefront, getStorefrontFilterOptions } from "@/services/storefront-product.service";
import { getAllCategoriesForPicker } from "@/services/category.service";
import { ProductListingResults, PRODUCT_LISTING_PAGE_SIZE } from "@/components/storefront/product-listing-results";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { getParam, parseListingFilters, type ListingSearchParams } from "@/lib/storefront/listing-params";

export const metadata: Metadata = {
  title: "Search",
};

const BASE_PATH = "/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;
  const query = getParam(params, "q") ?? "";
  const filters = parseListingFilters(params);

  const [{ rows, totalCount }, filterOptions, categories] = await Promise.all([
    query
      ? listProductsForStorefront({
          ...filters,
          search: query,
          page: filters.page,
          pageSize: PRODUCT_LISTING_PAGE_SIZE,
        })
      : Promise.resolve({ rows: [], totalCount: 0 }),
    getStorefrontFilterOptions(),
    getAllCategoriesForPicker(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: "Search" }]} />
      <h1 className="mb-6 font-heading text-3xl text-foreground">Search</h1>

      <form action={BASE_PATH} method="get" className="relative mb-10 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search for flowers, plants, gifts…"
          className="h-11 w-full rounded-full border border-input bg-transparent pl-10 pr-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </form>

      {!query ? (
        <p className="text-sm text-muted-foreground">Enter a keyword to search the shop.</p>
      ) : (
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
      )}
    </div>
  );
}

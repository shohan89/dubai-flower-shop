import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryForStorefront } from "@/services/category.service";
import { listProductsForStorefront, getStorefrontFilterOptions } from "@/services/storefront-product.service";
import { ProductListingResults, PRODUCT_LISTING_PAGE_SIZE } from "@/components/storefront/product-listing-results";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { CategoryHero } from "@/components/storefront/category-hero";
import { parseListingFilters, type ListingSearchParams } from "@/lib/storefront/listing-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryForStorefront(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingSearchParams>;
}) {
  const { slug } = await params;
  const category = await getCategoryForStorefront(slug);
  if (!category) notFound();

  const resolvedSearchParams = await searchParams;
  const filters = parseListingFilters(resolvedSearchParams);

  const [{ rows, totalCount }, filterOptions] = await Promise.all([
    listProductsForStorefront({
      ...filters,
      categorySlug: slug,
      page: filters.page,
      pageSize: PRODUCT_LISTING_PAGE_SIZE,
    }),
    getStorefrontFilterOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: category.name }]} />
      <CategoryHero category={category} />
      <ProductListingResults
        basePath={`/category/${slug}`}
        searchParams={resolvedSearchParams}
        page={filters.page}
        products={rows}
        totalCount={totalCount}
        occasions={filterOptions.occasions}
        flowerTypes={filterOptions.flowerTypes}
        plantTypes={filterOptions.plantTypes}
      />
    </div>
  );
}

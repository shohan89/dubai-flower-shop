import Link from "next/link";
import type { Route } from "next";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { SectionHeading } from "@/components/storefront/sections/category-grid-section";
import type { ResolvedSection } from "@/services/homepage.service";

type ProductSection = Extract<
  ResolvedSection,
  { type: "featured_products" | "bestsellers" | "trending_products" | "plant_section" | "collection_showcase" }
>;

export function ProductCarouselSection({ section }: { section: ProductSection }) {
  const { row, products } = section;
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <SectionHeading heading={row.heading} description={row.description} />
        {row.cta_text && row.cta_url ? (
          <Link href={row.cta_url as Route} className="shrink-0 text-sm font-medium text-primary hover:underline">
            {row.cta_text}
          </Link>
        ) : null}
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}

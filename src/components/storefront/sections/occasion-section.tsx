import Link from "next/link";
import { SectionHeading } from "@/components/storefront/sections/category-grid-section";
import type { ResolvedSection } from "@/services/homepage.service";

export function OccasionSection({
  section,
}: {
  section: Extract<ResolvedSection, { type: "occasion" }>;
}) {
  const { row, occasions } = section;
  if (occasions.length === 0) return null;

  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading heading={row.heading} description={row.description} align="center" />
        <div className="flex flex-wrap justify-center gap-3">
          {occasions.map((occasion) => (
            <Link
              key={occasion}
              href={`/shop?occasion=${encodeURIComponent(occasion)}`}
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {occasion}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

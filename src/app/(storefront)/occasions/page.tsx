import type { Metadata } from "next";
import Link from "next/link";
import { getStorefrontFilterOptions } from "@/services/storefront-product.service";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";

export const metadata: Metadata = {
  title: "Shop by Occasion",
  description: "Find the perfect flowers and gifts for every occasion.",
};

export default async function OccasionsPage() {
  const { occasions } = await getStorefrontFilterOptions();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: "Occasions" }]} />
      <h1 className="mb-2 font-heading text-3xl text-foreground">Shop by Occasion</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        From anniversaries to get-well-soons — find flowers and gifts for the moment.
      </p>
      {occasions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No occasions available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {occasions.map((occasion) => (
            <Link
              key={occasion}
              href={`/shop?occasion=${encodeURIComponent(occasion)}`}
              className="flex items-center justify-center rounded-xl border border-border bg-secondary px-6 py-10 text-center font-heading text-lg text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {occasion}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

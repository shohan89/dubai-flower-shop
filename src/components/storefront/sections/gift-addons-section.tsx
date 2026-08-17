import { ImageOff } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import { SectionHeading } from "@/components/storefront/sections/category-grid-section";
import { formatAed } from "@/lib/storefront/pricing";
import type { ResolvedSection } from "@/services/homepage.service";

export function GiftAddonsSection({
  section,
}: {
  section: Extract<ResolvedSection, { type: "gift_addons" }>;
}) {
  const { row, addons } = section;
  if (addons.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading heading={row.heading ?? "Perfect Add-ons"} description={row.description} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {addons.slice(0, 8).map((addon) => (
          <div key={addon.id} className="flex flex-col items-center gap-2 text-center">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
              {addon.image_url ? (
                <SafeImage src={addon.image_url} alt={addon.name} fill sizes="200px" className="object-cover" fallbackClassName="size-full" />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-6" />
                </div>
              )}
            </div>
            <p className="text-sm font-medium">{addon.name}</p>
            <p className="text-xs text-muted-foreground">{formatAed(addon.price)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

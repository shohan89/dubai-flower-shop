import { SafeImage } from "@/components/storefront/safe-image";
import type { Database } from "@/types/database.types";

export function CategoryHero({
  category,
}: {
  category: Database["public"]["Tables"]["categories"]["Row"];
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-secondary">
      {category.image_url ? (
        <div className="relative h-48 w-full sm:h-64">
          <SafeImage src={category.image_url} alt="" fill sizes="100vw" className="object-cover" fallbackClassName="size-full" />
          <div className="absolute inset-0 bg-primary/40" />
        </div>
      ) : null}
      <div
        className={
          category.image_url
            ? "absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            : "flex flex-col items-center justify-center px-6 py-14 text-center"
        }
      >
        <h1 className={`font-heading text-3xl sm:text-4xl ${category.image_url ? "text-brand-secondary" : "text-foreground"}`}>
          {category.name}
        </h1>
        {category.description ? (
          <p className={`mt-2 max-w-lg text-sm ${category.image_url ? "text-brand-secondary/85" : "text-muted-foreground"}`}>
            {category.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

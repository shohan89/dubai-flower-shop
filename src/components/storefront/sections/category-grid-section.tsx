import Link from "next/link";
import { ImageOff } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import type { ResolvedSection } from "@/services/homepage.service";

export function CategoryGridSection({
  section,
}: {
  section: Extract<ResolvedSection, { type: "category_grid" }>;
}) {
  const { row, categories } = section;
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading heading={row.heading} description={row.description} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex flex-col items-center gap-3 text-center"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted">
              {category.image_url ? (
                <SafeImage
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackClassName="size-full rounded-full"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-6" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({
  heading,
  description,
  align = "left",
  tone = "light",
}: {
  heading: string | null;
  description?: string | null;
  align?: "left" | "center";
  /** "dark" for sections on a dark (e.g. bg-primary) background. */
  tone?: "light" | "dark";
}) {
  if (!heading && !description) return null;
  const headingColor = tone === "dark" ? "text-brand-secondary" : "text-foreground";
  const descriptionColor = tone === "dark" ? "text-brand-secondary/70" : "text-muted-foreground";
  return (
    <div className={`mb-8 ${align === "center" ? "text-center" : ""}`}>
      {heading ? <h2 className={`font-heading text-2xl sm:text-3xl ${headingColor}`}>{heading}</h2> : null}
      {description ? <p className={`mt-2 max-w-xl text-sm ${descriptionColor}`}>{description}</p> : null}
    </div>
  );
}

import { Star } from "lucide-react";
import { SectionHeading } from "@/components/storefront/sections/category-grid-section";
import type { ResolvedSection } from "@/services/homepage.service";

export function TestimonialsSection({
  section,
}: {
  section: Extract<ResolvedSection, { type: "testimonials" }>;
}) {
  const { row, testimonials } = section;
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading heading={row.heading} description={row.description} align="center" tone="dark" />
        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <figure key={index} className="rounded-2xl bg-white/5 p-6">
              <div className="mb-3 flex gap-0.5 text-brand-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-4 ${i < testimonial.rating ? "fill-brand-gold" : "opacity-30"}`} />
                ))}
              </div>
              <blockquote className="text-sm text-brand-secondary/90">&ldquo;{testimonial.body}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-brand-secondary">
                {testimonial.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

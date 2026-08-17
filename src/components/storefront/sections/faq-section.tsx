import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/storefront/sections/category-grid-section";
import type { ResolvedSection } from "@/services/homepage.service";

export function FaqSection({ section }: { section: Extract<ResolvedSection, { type: "faq" }> }) {
  const { row, faqs } = section;
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading heading={row.heading ?? "Frequently Asked Questions"} description={row.description} align="center" />
      <div className="divide-y divide-border rounded-xl border border-border">
        {faqs.map((faq) => (
          <details key={faq.id} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

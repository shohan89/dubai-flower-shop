import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import type { ResolvedSection } from "@/services/homepage.service";

export function PromoBannerSection({
  section,
}: {
  section: Extract<ResolvedSection, { type: "promo_banner" }>;
}) {
  const { row } = section;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-accent/15 px-8 py-14 text-center">
        {row.heading ? <h2 className="font-heading text-2xl text-foreground sm:text-3xl">{row.heading}</h2> : null}
        {row.description ? <p className="max-w-md text-sm text-muted-foreground">{row.description}</p> : null}
        {row.cta_text && row.cta_url ? (
          <Button
            className="mt-2"
            nativeButton={false}
            render={<Link href={row.cta_url as Route}>{row.cta_text}</Link>}
          />
        ) : null}
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import type { ResolvedSection } from "@/services/homepage.service";

export function HeroSection({ section }: { section: Extract<ResolvedSection, { type: "hero" }> }) {
  const { row, content } = section;

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-primary">
      {content.imageUrl ? (
        <Image
          src={content.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
      ) : null}
      <div className="relative mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
        {row.subheading ? (
          <p className="mb-4 font-sans text-sm tracking-[0.3em] text-brand-gold uppercase">
            {row.subheading}
          </p>
        ) : null}
        <h1 className="font-heading text-4xl leading-tight text-brand-secondary sm:text-6xl">
          {row.heading}
        </h1>
        {row.description ? (
          <p className="mx-auto mt-5 max-w-md text-base text-brand-secondary/80">{row.description}</p>
        ) : null}
        {row.cta_text && row.cta_url ? (
          <Button
          size="lg"
          className="mt-8 bg-brand-gold text-primary hover:bg-brand-gold/90"
          nativeButton={false}
          render={<Link href={row.cta_url as Route}>{row.cta_text}</Link>}
        />
        ) : null}
      </div>
    </section>
  );
}

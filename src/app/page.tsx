import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-secondary px-6 py-32 text-center">
      <p className="font-sans text-sm tracking-[0.3em] text-brand-gold uppercase">
        Dubai · Flowers &amp; Plants
      </p>
      <h1 className="max-w-2xl font-heading text-5xl leading-tight text-primary sm:text-6xl">
        A design system in bloom
      </h1>
      <p className="max-w-md font-sans text-base text-muted-foreground">
        Foundations are in place. The storefront, CMS-driven homepage, and
        shop will be built out phase by phase from here.
      </p>
      <Button size="lg">Explore the collection</Button>
    </main>
  );
}

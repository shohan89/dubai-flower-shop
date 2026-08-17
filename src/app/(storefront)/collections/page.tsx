import type { Metadata } from "next";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import { getAllCollectionsForPicker } from "@/services/collection.service";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections of flowers, plants, and gifts.",
};

export default async function CollectionsPage() {
  const collections = await getAllCollectionsForPicker();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <StorefrontBreadcrumb items={[{ label: "Collections" }]} />
      <h1 className="mb-8 font-heading text-3xl text-foreground">Collections</h1>
      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections available yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/shop?collection=${collection.slug}`}
              className="group overflow-hidden rounded-xl border border-border"
            >
              <div className="relative aspect-[4/3] bg-muted">
                {collection.image_url ? (
                  <SafeImage
                    src={collection.image_url}
                    alt={collection.name}
                    fill
                    sizes="400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fallbackClassName="size-full"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-heading text-lg text-foreground">{collection.name}</h2>
                {collection.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

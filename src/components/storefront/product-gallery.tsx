"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { SafeImage } from "@/components/storefront/safe-image";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];

export function ProductGallery({ images, productName }: { images: ImageRow[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <SafeImage
          src={active.url}
          alt={active.alt_text ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
          fallbackClassName="size-full"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent",
              )}
            >
              <SafeImage src={image.url} alt="" fill sizes="64px" className="object-cover" fallbackClassName="size-full" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

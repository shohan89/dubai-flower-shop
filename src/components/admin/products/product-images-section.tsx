"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ImageOff, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/shared/image-uploader";
import {
  addProductImageAction,
  deleteProductImageAction,
  setPrimaryImageAction,
} from "@/app/admin/(dashboard)/products/actions";
import type { Database } from "@/types/database.types";

type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];

export function ProductImagesSection({
  productId,
  images,
}: {
  productId: string;
  images: ImageRow[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploader
          pathPrefix={`products/${productId}`}
          onUploaded={({ url }) => {
            startTransition(async () => {
              await addProductImageAction(productId, {
                url,
                isPrimary: images.length === 0,
              });
            });
          }}
        />
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg border border-border">
                <ImageTile url={image.url} altText={image.alt_text} />
                {image.is_primary ? (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Primary
                  </span>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!image.is_primary ? (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="secondary"
                      disabled={isPending}
                      aria-label="Set as primary"
                      onClick={() =>
                        startTransition(() => setPrimaryImageAction(productId, image.id))
                      }
                    >
                      <Star className="size-3.5" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="destructive"
                    disabled={isPending}
                    aria-label="Delete image"
                    onClick={() =>
                      startTransition(() => deleteProductImageAction(productId, image.id))
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImageTile({ url, altText }: { url: string; altText: string | null }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="size-6" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-muted">
      <Image
        src={url}
        alt={altText ?? ""}
        fill
        sizes="200px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

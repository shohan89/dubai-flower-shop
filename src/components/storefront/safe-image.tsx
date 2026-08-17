"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wraps next/image with a graceful fallback when the underlying URL
 * 404s/400s — e.g. seed-data placeholder paths that were never real
 * files. Without this, a broken image just fails silently in the
 * network tab while the layout shows an empty box; this shows an
 * icon instead, consistent with the admin media UI.
 */
export function SafeImage({
  className,
  fallbackClassName,
  alt,
  ...props
}: ImageProps & { fallbackClassName?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", fallbackClassName ?? className)}>
        <ImageOff className="size-6" />
      </div>
    );
  }

  return <Image {...props} alt={alt} className={className} onError={() => setFailed(true)} />;
}

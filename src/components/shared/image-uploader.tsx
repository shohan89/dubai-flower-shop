"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Uploads directly from the browser to the Supabase Storage `media`
 * bucket — not proxied through a Server Action (avoids the default
 * request body size limit for a handful-of-MB image). This is still
 * safe: the bucket's RLS policy requires `is_staff()` regardless of
 * what the client sends, and the bucket itself enforces the MIME/size
 * limits server-side (see supabase/migrations/*_storage_buckets.sql) —
 * the checks here are UX-only, not the real enforcement.
 */
export function ImageUploader({
  pathPrefix,
  onUploaded,
  disabled,
}: {
  pathPrefix: string;
  onUploaded: (result: { url: string; path: string }) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`${file.name}: unsupported file type.`);
          continue;
        }
        if (file.size > MAX_SIZE_BYTES) {
          setError(`${file.name}: file is larger than 5MB.`);
          continue;
        }

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const { data } = supabase.storage.from("media").getPublicUrl(path);
        onUploaded({ url: data.publicUrl, path });
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        {isUploading ? "Uploading…" : "Upload image"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

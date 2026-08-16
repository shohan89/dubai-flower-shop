"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { ImageUploader } from "@/components/shared/image-uploader";
import type { Database } from "@/types/database.types";
import type { CollectionFormState } from "@/app/admin/(dashboard)/collections/actions";

type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

export function CollectionForm({
  collection,
  action,
  onSuccess,
}: {
  collection?: CollectionRow;
  action: (prevState: CollectionFormState, formData: FormData) => Promise<CollectionFormState>;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(collection?.image_url ?? "");
  const [isActive, setIsActive] = useState(collection?.is_active ?? true);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField id="col-name" label="Name" required>
        <Input id="col-name" name="name" defaultValue={collection?.name} required />
      </FormField>
      <FormField id="col-slug" label="Slug" required>
        <Input id="col-slug" name="slug" defaultValue={collection?.slug} required />
      </FormField>
      <FormField id="col-description" label="Description">
        <Textarea id="col-description" name="description" defaultValue={collection?.description ?? ""} rows={3} />
      </FormField>
      <FormField id="col-order" label="Display order">
        <Input id="col-order" name="displayOrder" type="number" min="0" defaultValue={collection?.display_order ?? 0} />
      </FormField>
      <div className="space-y-2">
        <Label>Image</Label>
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <ImageUploader pathPrefix="collections" onUploaded={({ url }) => setImageUrl(url)} />
        {imageUrl ? <p className="truncate text-xs text-muted-foreground">{imageUrl}</p> : null}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="col-active" className="text-sm font-normal">
          Active
        </Label>
        <Switch id="col-active" checked={isActive} onCheckedChange={setIsActive} />
        <input type="checkbox" name="isActive" checked={isActive} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{collection ? "Save changes" : "Create collection"}</SubmitButton>
    </form>
  );
}

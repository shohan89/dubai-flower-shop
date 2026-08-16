"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { PriceInput } from "@/components/shared/price-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { ImageUploader } from "@/components/shared/image-uploader";
import type { Database } from "@/types/database.types";
import type { AddonFormState } from "@/app/admin/(dashboard)/addons/actions";

type AddonRow = Database["public"]["Tables"]["addons"]["Row"];

export function AddonForm({
  addon,
  action,
  onSuccess,
}: {
  addon?: AddonRow;
  action: (prevState: AddonFormState, formData: FormData) => Promise<AddonFormState>;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(addon?.image_url ?? "");
  const [isActive, setIsActive] = useState(addon?.is_active ?? true);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField id="addon-name" label="Name" required>
        <Input id="addon-name" name="name" defaultValue={addon?.name} required />
      </FormField>
      <FormField id="addon-slug" label="Slug" required>
        <Input id="addon-slug" name="slug" defaultValue={addon?.slug} required />
      </FormField>
      <FormField id="addon-description" label="Description">
        <Textarea id="addon-description" name="description" defaultValue={addon?.description ?? ""} rows={2} />
      </FormField>
      <PriceInput id="addon-price" name="price" label="Price" defaultValue={addon?.price} required />
      <FormField id="addon-stock" label="Stock quantity (leave blank if unlimited)">
        <Input id="addon-stock" name="stockQuantity" type="number" min="0" defaultValue={addon?.stock_quantity ?? ""} />
      </FormField>
      <div className="space-y-2">
        <Label>Image</Label>
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <ImageUploader pathPrefix="addons" onUploaded={({ url }) => setImageUrl(url)} />
        {imageUrl ? <p className="truncate text-xs text-muted-foreground">{imageUrl}</p> : null}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="addon-active" className="text-sm font-normal">
          Active
        </Label>
        <Switch id="addon-active" checked={isActive} onCheckedChange={setIsActive} />
        <input type="checkbox" name="isActive" checked={isActive} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{addon ? "Save changes" : "Create add-on"}</SubmitButton>
    </form>
  );
}

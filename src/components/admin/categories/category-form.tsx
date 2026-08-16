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
import type { CategoryFormState } from "@/app/admin/(dashboard)/categories/actions";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export function CategoryForm({
  category,
  allCategories,
  action,
  onSuccess,
}: {
  category?: CategoryRow;
  allCategories: CategoryRow[];
  action: (prevState: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField id="cat-name" label="Name" required>
        <Input id="cat-name" name="name" defaultValue={category?.name} required />
      </FormField>
      <FormField id="cat-slug" label="Slug" required>
        <Input id="cat-slug" name="slug" defaultValue={category?.slug} required />
      </FormField>
      <FormField id="cat-description" label="Description">
        <Textarea id="cat-description" name="description" defaultValue={category?.description ?? ""} rows={3} />
      </FormField>
      <FormField id="cat-parent" label="Parent category">
        <select
          id="cat-parent"
          name="parentId"
          defaultValue={category?.parent_id ?? ""}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
        >
          <option value="">— None —</option>
          {allCategories
            .filter((c) => c.id !== category?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </FormField>
      <FormField id="cat-order" label="Display order">
        <Input id="cat-order" name="displayOrder" type="number" min="0" defaultValue={category?.display_order ?? 0} />
      </FormField>
      <div className="space-y-2">
        <Label>Image</Label>
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <ImageUploader
          pathPrefix="categories"
          onUploaded={({ url }) => setImageUrl(url)}
        />
        {imageUrl ? <p className="truncate text-xs text-muted-foreground">{imageUrl}</p> : null}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="cat-active" className="text-sm font-normal">
          Active
        </Label>
        <Switch id="cat-active" checked={isActive} onCheckedChange={setIsActive} />
        <input type="checkbox" name="isActive" checked={isActive} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{category ? "Save changes" : "Create category"}</SubmitButton>
    </form>
  );
}

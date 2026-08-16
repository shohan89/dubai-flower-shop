"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormField } from "@/components/shared/form-field";
import { Drawer } from "@/components/shared/drawer";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  createVariantAction,
  updateVariantAction,
  deleteVariantAction,
  type VariantFormState,
} from "@/app/admin/(dashboard)/products/actions";
import type { Database } from "@/types/database.types";

type VariantRow = Database["public"]["Tables"]["product_variants"]["Row"];

export function ProductVariantsSection({
  productId,
  variants,
}: {
  productId: string;
  variants: VariantRow[];
}) {
  const [editing, setEditing] = useState<VariantRow | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Variants</CardTitle>
        <Button type="button" size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Add variant
        </Button>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants — this product sells as a single item.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price override</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                  <TableCell>{variant.price_override ? `AED ${variant.price_override}` : "—"}</TableCell>
                  <TableCell>{variant.stock_quantity}</TableCell>
                  <TableCell>{variant.is_default ? "Yes" : ""}</TableCell>
                  <TableCell className="flex justify-end gap-1 text-right">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      aria-label="Edit variant"
                      onClick={() => setEditing(variant)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="destructive"
                      aria-label="Delete variant"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => deleteVariantAction(productId, variant.id))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Drawer
        title={editing === "new" ? "Add variant" : "Edit variant"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <VariantForm
            productId={productId}
            variant={editing === "new" ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </Drawer>
    </Card>
  );
}

function VariantForm({
  productId,
  variant,
  onDone,
}: {
  productId: string;
  variant?: VariantRow;
  onDone: () => void;
}) {
  const boundAction = variant
    ? updateVariantAction.bind(null, productId, variant.id)
    : createVariantAction.bind(null, productId);
  const [state, formAction] = useActionState<VariantFormState, FormData>(boundAction, {});

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        onDone();
      }}
      className="space-y-4"
    >
      <FormField id="variant-name" label="Name" required>
        <Input id="variant-name" name="name" defaultValue={variant?.name} required />
      </FormField>
      <FormField id="variant-sku" label="SKU" required>
        <Input id="variant-sku" name="sku" defaultValue={variant?.sku} required />
      </FormField>
      <FormField id="variant-price" label="Price override (AED)">
        <Input
          id="variant-price"
          name="priceOverride"
          type="number"
          step="0.01"
          min="0"
          defaultValue={variant?.price_override ?? ""}
        />
      </FormField>
      <FormField id="variant-stock" label="Stock quantity">
        <Input
          id="variant-stock"
          name="stockQuantity"
          type="number"
          min="0"
          defaultValue={variant?.stock_quantity ?? 0}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={variant?.is_default ?? false} />
        Default variant
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{variant ? "Save variant" : "Add variant"}</SubmitButton>
    </form>
  );
}

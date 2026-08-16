"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { adjustInventoryAction } from "@/app/admin/(dashboard)/inventory/actions";

export function InventoryAdjustForm({
  inventoryId,
  currentAvailable,
  onSuccess,
}: {
  inventoryId: string;
  currentAvailable: number;
  onSuccess: () => void;
}) {
  const boundAction = adjustInventoryAction.bind(null, inventoryId);
  const [state, formAction] = useActionState(boundAction, {});

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-muted-foreground">Currently available: {currentAvailable}</p>
      <FormField id="delta" label="Quantity change (use a negative number to remove stock)" required>
        <Input id="delta" name="delta" type="number" step="1" required />
      </FormField>
      <FormField id="reason" label="Reason" required>
        <select
          id="reason"
          name="reason"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
          defaultValue="adjustment"
        >
          <option value="purchase_order">Purchase order (stock in)</option>
          <option value="return">Return (stock in)</option>
          <option value="damaged">Damaged (stock out)</option>
          <option value="adjustment">Manual adjustment</option>
          <option value="initial_stock">Initial stock</option>
        </select>
      </FormField>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>Apply adjustment</SubmitButton>
    </form>
  );
}

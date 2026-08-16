"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { PriceInput } from "@/components/shared/price-input";
import { SubmitButton } from "@/components/shared/submit-button";
import type { Database } from "@/types/database.types";
import type { DeliverySlotFormState } from "@/app/admin/(dashboard)/delivery/slots/actions";

type SlotRow = Database["public"]["Tables"]["delivery_slots"]["Row"];

export function SlotForm({
  slot,
  action,
  onSuccess,
}: {
  slot?: SlotRow;
  action: (prevState: DeliverySlotFormState, formData: FormData) => Promise<DeliverySlotFormState>;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {});
  const [isSameDay, setIsSameDay] = useState(slot?.is_same_day ?? false);
  const [isActive, setIsActive] = useState(slot?.is_active ?? true);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField id="slot-label" label="Label" required>
        <Input id="slot-label" name="label" defaultValue={slot?.label} placeholder="9:00 AM - 12:00 PM" required />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="slot-start" label="Start time" required>
          <Input id="slot-start" name="startTime" type="time" defaultValue={slot?.start_time?.slice(0, 5)} required />
        </FormField>
        <FormField id="slot-end" label="End time" required>
          <Input id="slot-end" name="endTime" type="time" defaultValue={slot?.end_time?.slice(0, 5)} required />
        </FormField>
      </div>
      <PriceInput id="slot-fee" name="extraFee" label="Extra fee" defaultValue={slot?.extra_fee ?? "0"} />
      <FormField id="slot-order" label="Display order">
        <Input id="slot-order" name="displayOrder" type="number" min="0" defaultValue={slot?.display_order ?? 0} />
      </FormField>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="slot-same-day" className="text-sm font-normal">
          Same-day slot
        </Label>
        <Switch id="slot-same-day" checked={isSameDay} onCheckedChange={setIsSameDay} />
        <input type="checkbox" name="isSameDay" checked={isSameDay} readOnly hidden />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="slot-active" className="text-sm font-normal">
          Active
        </Label>
        <Switch id="slot-active" checked={isActive} onCheckedChange={setIsActive} />
        <input type="checkbox" name="isActive" checked={isActive} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{slot ? "Save changes" : "Create slot"}</SubmitButton>
    </form>
  );
}

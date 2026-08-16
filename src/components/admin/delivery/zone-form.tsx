"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { PriceInput } from "@/components/shared/price-input";
import { SubmitButton } from "@/components/shared/submit-button";
import type { Database } from "@/types/database.types";
import type { DeliveryZoneFormState } from "@/app/admin/(dashboard)/delivery/zones/actions";

type ZoneRow = Database["public"]["Tables"]["delivery_zones"]["Row"];

export function ZoneForm({
  zone,
  action,
  onSuccess,
}: {
  zone?: ZoneRow;
  action: (prevState: DeliveryZoneFormState, formData: FormData) => Promise<DeliveryZoneFormState>;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {});
  const [sameDay, setSameDay] = useState(zone?.same_day_available ?? true);
  const [isActive, setIsActive] = useState(zone?.is_active ?? true);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField id="zone-name" label="Name" required>
        <Input id="zone-name" name="name" defaultValue={zone?.name} required />
      </FormField>
      <FormField id="zone-description" label="Description">
        <Textarea id="zone-description" name="description" defaultValue={zone?.description ?? ""} rows={2} />
      </FormField>
      <PriceInput id="zone-fee" name="baseDeliveryFee" label="Base delivery fee" defaultValue={zone?.base_delivery_fee} required />
      <PriceInput id="zone-min" name="minimumOrderAmount" label="Minimum order amount" defaultValue={zone?.minimum_order_amount ?? "0"} />
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="zone-same-day" className="text-sm font-normal">
          Same-day delivery available
        </Label>
        <Switch id="zone-same-day" checked={sameDay} onCheckedChange={setSameDay} />
        <input type="checkbox" name="sameDayAvailable" checked={sameDay} readOnly hidden />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="zone-active" className="text-sm font-normal">
          Active
        </Label>
        <Switch id="zone-active" checked={isActive} onCheckedChange={setIsActive} />
        <input type="checkbox" name="isActive" checked={isActive} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{zone ? "Save changes" : "Create zone"}</SubmitButton>
    </form>
  );
}

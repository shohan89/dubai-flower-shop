"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import type { Database } from "@/types/database.types";
import type { CouponFormState } from "@/app/admin/(dashboard)/coupons/actions";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export function CouponForm({
  coupon,
  action,
  onSuccess,
}: {
  coupon?: CouponRow;
  action: (prevState: CouponFormState, formData: FormData) => Promise<CouponFormState>;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {});
  const [isActive, setIsActive] = useState(coupon?.is_active ?? true);

  useEffect(() => {
    if (state.success) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <FormField id="coupon-code" label="Code" required>
        <Input id="coupon-code" name="code" defaultValue={coupon?.code} required className="uppercase" />
      </FormField>
      <FormField id="coupon-description" label="Description">
        <Textarea id="coupon-description" name="description" defaultValue={coupon?.description ?? ""} rows={2} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="coupon-type" label="Discount type" required>
          <select
            id="coupon-type"
            name="discountType"
            defaultValue={coupon?.discount_type ?? "percentage"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed amount (AED)</option>
          </select>
        </FormField>
        <FormField id="coupon-value" label="Discount value" required>
          <Input id="coupon-value" name="discountValue" type="number" step="0.01" min="0" defaultValue={coupon?.discount_value} required />
        </FormField>
      </div>
      <FormField id="coupon-min" label="Minimum order amount (AED)">
        <Input id="coupon-min" name="minimumOrderAmount" type="number" step="0.01" min="0" defaultValue={coupon?.minimum_order_amount ?? "0"} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="coupon-limit" label="Total usage limit">
          <Input id="coupon-limit" name="usageLimit" type="number" min="1" defaultValue={coupon?.usage_limit ?? ""} />
        </FormField>
        <FormField id="coupon-limit-customer" label="Limit per customer">
          <Input id="coupon-limit-customer" name="usageLimitPerCustomer" type="number" min="1" defaultValue={coupon?.usage_limit_per_customer ?? ""} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="coupon-starts" label="Starts at">
          <Input
            id="coupon-starts"
            name="startsAt"
            type="datetime-local"
            defaultValue={coupon?.starts_at ? coupon.starts_at.slice(0, 16) : ""}
          />
        </FormField>
        <FormField id="coupon-ends" label="Ends at">
          <Input
            id="coupon-ends"
            name="endsAt"
            type="datetime-local"
            defaultValue={coupon?.ends_at ? coupon.ends_at.slice(0, 16) : ""}
          />
        </FormField>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="coupon-active" className="text-sm font-normal">
          Active
        </Label>
        <Switch id="coupon-active" checked={isActive} onCheckedChange={setIsActive} />
        <input type="checkbox" name="isActive" checked={isActive} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <SubmitButton>{coupon ? "Save changes" : "Create coupon"}</SubmitButton>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { parseCouponFormData } from "@/validations/coupon.schema";
import {
  createCouponFromInput,
  updateCouponFromInput,
  deleteCouponById,
} from "@/services/coupon.service";

export type CouponFormState = { error?: string; success?: boolean };

export async function createCouponAction(
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requirePermission("coupons");
  const parsed = parseCouponFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await createCouponFromInput(parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(
  id: string,
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requirePermission("coupons");
  const parsed = parseCouponFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await updateCouponFromInput(id, parsed.data);
  if ("error" in result) return { error: result.error };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: string): Promise<void> {
  await requirePermission("coupons");
  await deleteCouponById(id);
  revalidatePath("/admin/coupons");
}

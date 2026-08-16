import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  softDeleteCoupon,
} from "@/repositories/coupons.repository";
import { couponSchema, type CouponInput } from "@/validations/coupon.schema";

export async function listCouponsForAdmin(params: {
  search?: string;
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();
  return listCoupons(supabase, params);
}

export async function getCouponForEdit(id: string) {
  const supabase = await createClient();
  return getCouponById(supabase, id);
}

async function assertUniqueCouponCode(code: string, excludeId?: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select("id")
    .ilike("code", code)
    .maybeSingle();
  if (data && data.id !== excludeId) return "That code is already in use.";
  return null;
}

function toRecord(input: CouponInput) {
  return {
    code: input.code.toUpperCase(),
    description: input.description ?? null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    minimum_order_amount: input.minimumOrderAmount ?? "0",
    usage_limit: input.usageLimit ? Number(input.usageLimit) : null,
    usage_limit_per_customer: input.usageLimitPerCustomer ? Number(input.usageLimitPerCustomer) : null,
    starts_at: input.startsAt ? new Date(input.startsAt).toISOString() : null,
    ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    is_active: input.isActive,
  };
}

export async function createCouponFromInput(raw: CouponInput) {
  const input = couponSchema.parse(raw);
  const conflict = await assertUniqueCouponCode(input.code);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const coupon = await createCoupon(supabase, toRecord(input));
  return { coupon };
}

export async function updateCouponFromInput(id: string, raw: CouponInput) {
  const input = couponSchema.parse(raw);
  const conflict = await assertUniqueCouponCode(input.code, id);
  if (conflict) return { error: conflict };
  const supabase = await createClient();
  const coupon = await updateCoupon(supabase, id, toRecord(input));
  return { coupon };
}

export async function deleteCouponById(id: string) {
  const supabase = await createClient();
  await softDeleteCoupon(supabase, id);
}

import { z } from "zod";

const money = z.string().trim().refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount");
const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount");
const optionalInt = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d+$/.test(v), "Enter a whole number");
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, hyphens, and underscores only"),
    description: z.string().trim().max(500).optional().transform((v) => (v ? v : undefined)),
    discountType: z.enum(["percentage", "fixed_amount"]),
    discountValue: money,
    minimumOrderAmount: optionalMoney,
    usageLimit: optionalInt,
    usageLimitPerCustomer: optionalInt,
    startsAt: optionalDate,
    endsAt: optionalDate,
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => data.discountType !== "percentage" || Number(data.discountValue) <= 100,
    { message: "Percentage discounts cannot exceed 100", path: ["discountValue"] },
  );

export type CouponInput = z.infer<typeof couponSchema>;

export function parseCouponFormData(formData: FormData) {
  return couponSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minimumOrderAmount: formData.get("minimumOrderAmount"),
    usageLimit: formData.get("usageLimit"),
    usageLimitPerCustomer: formData.get("usageLimitPerCustomer"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isActive: formData.get("isActive") === "on",
  });
}

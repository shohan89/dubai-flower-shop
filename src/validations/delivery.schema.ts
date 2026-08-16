import { z } from "zod";

const money = z.string().trim().refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount");

export const deliveryZoneSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  description: z.string().trim().max(500).optional().transform((v) => (v ? v : undefined)),
  baseDeliveryFee: money,
  minimumOrderAmount: money.default("0"),
  sameDayAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});
export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>;

export function parseDeliveryZoneFormData(formData: FormData) {
  return deliveryZoneSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    baseDeliveryFee: formData.get("baseDeliveryFee"),
    minimumOrderAmount: formData.get("minimumOrderAmount") || "0",
    sameDayAvailable: formData.get("sameDayAvailable") === "on",
    isActive: formData.get("isActive") === "on",
  });
}

export const deliverySlotSchema = z.object({
  label: z.string().trim().min(2, "Label is required").max(100),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  isSameDay: z.boolean().default(false),
  extraFee: money.default("0"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type DeliverySlotInput = z.infer<typeof deliverySlotSchema>;

export function parseDeliverySlotFormData(formData: FormData) {
  return deliverySlotSchema.safeParse({
    label: formData.get("label"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    isSameDay: formData.get("isSameDay") === "on",
    extraFee: formData.get("extraFee") || "0",
    displayOrder: formData.get("displayOrder") || "0",
    isActive: formData.get("isActive") === "on",
  });
}

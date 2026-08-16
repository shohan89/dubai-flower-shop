import { z } from "zod";

export const addonSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().max(500).optional().transform((v) => (v ? v : undefined)),
  price: z
    .string()
    .trim()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount"),
  imageUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  stockQuantity: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d+$/.test(v), "Enter a whole number"),
  isActive: z.boolean().default(true),
});

export type AddonInput = z.infer<typeof addonSchema>;

export function parseAddonFormData(formData: FormData) {
  return addonSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl"),
    stockQuantity: formData.get("stockQuantity"),
    isActive: formData.get("isActive") === "on",
  });
}

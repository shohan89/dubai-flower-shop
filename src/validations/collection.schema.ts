import { z } from "zod";

export const collectionSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().max(1000).optional().transform((v) => (v ? v : undefined)),
  imageUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export function parseCollectionFormData(formData: FormData) {
  return collectionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    displayOrder: formData.get("displayOrder") || "0",
    isActive: formData.get("isActive") === "on",
  });
}

import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().max(1000).optional().transform((v) => (v ? v : undefined)),
  imageUrl: z.string().trim().url().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  parentId: z.string().uuid().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function parseCategoryFormData(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    parentId: formData.get("parentId") || undefined,
    displayOrder: formData.get("displayOrder") || "0",
    isActive: formData.get("isActive") === "on",
  });
}

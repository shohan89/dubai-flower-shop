import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional().transform((v) => (v ? v : undefined)),
  body: z.string().trim().max(2000).optional().transform((v) => (v ? v : undefined)),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export function parseReviewFormData(formData: FormData) {
  return reviewSchema.safeParse({
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
}

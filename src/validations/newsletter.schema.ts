import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export function parseNewsletterFormData(formData: FormData) {
  return newsletterSchema.safeParse({ email: formData.get("email") });
}

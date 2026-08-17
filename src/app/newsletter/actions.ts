"use server";

import { createClient } from "@/lib/supabase/server";
import { subscribeToNewsletter } from "@/repositories/newsletter.repository";
import { parseNewsletterFormData } from "@/validations/newsletter.schema";

export type NewsletterActionState = { error?: string; success?: boolean };

export async function subscribeNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const parsed = parseNewsletterFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  await subscribeToNewsletter(supabase, parsed.data.email);
  return { success: true };
}

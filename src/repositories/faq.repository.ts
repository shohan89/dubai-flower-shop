import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export async function listActiveFaqs(
  supabase: SupabaseClient<Database>,
  faqCategoryId?: string,
) {
  let query = supabase.from("faqs").select("*").eq("is_active", true);
  if (faqCategoryId) query = query.eq("faq_category_id", faqCategoryId);
  query = query.order("display_order", { ascending: true });
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

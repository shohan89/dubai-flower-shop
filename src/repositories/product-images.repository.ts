import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];

export async function listProductImages(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<ImageRow[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addProductImage(
  supabase: SupabaseClient<Database>,
  input: { productId: string; url: string; altText?: string | null; isPrimary?: boolean },
): Promise<ImageRow> {
  if (input.isPrimary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", input.productId)
      .is("variant_id", null);
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: input.productId,
      url: input.url,
      alt_text: input.altText ?? null,
      is_primary: input.isPrimary ?? false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setPrimaryProductImage(
  supabase: SupabaseClient<Database>,
  productId: string,
  imageId: string,
): Promise<void> {
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .is("variant_id", null);
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  if (error) throw error;
}

export async function deleteProductImage(
  supabase: SupabaseClient<Database>,
  imageId: string,
): Promise<void> {
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
}

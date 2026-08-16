import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type VariantRow = Database["public"]["Tables"]["product_variants"]["Row"];
type VariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"];
type VariantUpdate = Database["public"]["Tables"]["product_variants"]["Update"];

export async function listProductVariants(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<VariantRow[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createProductVariant(
  supabase: SupabaseClient<Database>,
  input: VariantInsert,
): Promise<VariantRow> {
  if (input.is_default) {
    await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", input.product_id);
  }
  const { data, error } = await supabase
    .from("product_variants")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateProductVariant(
  supabase: SupabaseClient<Database>,
  id: string,
  productId: string,
  patch: VariantUpdate,
): Promise<VariantRow> {
  if (patch.is_default) {
    await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", productId);
  }
  const { data, error } = await supabase
    .from("product_variants")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductVariant(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("product_variants")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

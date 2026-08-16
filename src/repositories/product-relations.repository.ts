import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Junction-table management for a product's categories, collections, and
 * addons. Each "set" function replaces the full set via delete-then-insert
 * rather than a diff — simple and correct for admin-only, low-concurrency
 * edits. Not wrapped in a real DB transaction (supabase-js doesn't expose
 * one without a dedicated RPC); an admin can just retry on partial failure.
 */

export async function getProductCategoryLinks(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<{ categoryIds: string[]; primaryCategoryId: string | null }> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("category_id, is_primary")
    .eq("product_id", productId);
  if (error) throw error;
  const rows = data ?? [];
  return {
    categoryIds: rows.map((row) => row.category_id),
    primaryCategoryId: rows.find((row) => row.is_primary)?.category_id ?? null,
  };
}

export async function setProductCategories(
  supabase: SupabaseClient<Database>,
  productId: string,
  categoryIds: string[],
  primaryCategoryId?: string | null,
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (categoryIds.length === 0) return;

  const { error: insertError } = await supabase.from("product_categories").insert(
    categoryIds.map((categoryId) => ({
      product_id: productId,
      category_id: categoryId,
      is_primary: categoryId === primaryCategoryId,
    })),
  );
  if (insertError) throw insertError;
}

export async function getProductCollectionIds(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("collection_products")
    .select("collection_id")
    .eq("product_id", productId);
  if (error) throw error;
  return (data ?? []).map((row) => row.collection_id);
}

export async function setProductCollections(
  supabase: SupabaseClient<Database>,
  productId: string,
  collectionIds: string[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("collection_products")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (collectionIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("collection_products")
    .insert(collectionIds.map((collectionId) => ({ product_id: productId, collection_id: collectionId })));
  if (insertError) throw insertError;
}

export async function getProductAddonIds(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("product_addons")
    .select("addon_id")
    .eq("product_id", productId);
  if (error) throw error;
  return (data ?? []).map((row) => row.addon_id);
}

export async function setProductAddons(
  supabase: SupabaseClient<Database>,
  productId: string,
  addonIds: string[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("product_addons")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (addonIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("product_addons")
    .insert(addonIds.map((addonId) => ({ product_id: productId, addon_id: addonId })));
  if (insertError) throw insertError;
}

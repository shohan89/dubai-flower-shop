import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const DEFAULT_WISHLIST_NAME = "My Wishlist";

export async function getOrCreateDefaultWishlist(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data: existing, error: existingError } = await supabase
    .from("wishlists")
    .select("*")
    .eq("user_id", userId)
    .eq("name", DEFAULT_WISHLIST_NAME)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId, name: DEFAULT_WISHLIST_NAME })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listWishlistProductIds(
  supabase: SupabaseClient<Database>,
  wishlistId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("wishlist_id", wishlistId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.product_id));
}

export async function listWishlistItemsWithProducts(
  supabase: SupabaseClient<Database>,
  wishlistId: string,
) {
  const { data: items, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("wishlist_id", wishlistId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!items || items.length === 0) return [];

  const productIds = Array.from(new Set(items.map((i) => i.product_id)));
  const [{ data: products, error: productsError }, { data: images, error: imagesError }] = await Promise.all([
    supabase.from("products").select("*").in("id", productIds),
    supabase
      .from("product_images")
      .select("product_id, url")
      .in("product_id", productIds)
      .is("variant_id", null)
      .eq("is_primary", true),
  ]);
  if (productsError) throw productsError;
  if (imagesError) throw imagesError;

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const imageMap = new Map((images ?? []).map((img) => [img.product_id, img.url]));

  return items
    .map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) return null;
      return { item, product, imageUrl: imageMap.get(item.product_id) ?? null };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
}

export async function addWishlistItem(
  supabase: SupabaseClient<Database>,
  wishlistId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ wishlist_id: wishlistId, product_id: productId })
    .select("id")
    .maybeSingle();
  // Unique-constraint conflicts (already wishlisted) are fine to ignore.
  if (error && error.code !== "23505") throw error;
}

export async function removeWishlistItem(
  supabase: SupabaseClient<Database>,
  wishlistId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId);
  if (error) throw error;
}

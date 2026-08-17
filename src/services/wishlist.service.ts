import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/authorization.service";
import {
  getOrCreateDefaultWishlist,
  listWishlistProductIds,
  listWishlistItemsWithProducts,
  addWishlistItem,
  removeWishlistItem,
} from "@/repositories/wishlist.repository";

/** Returns null (not an error) for signed-out visitors — wishlist is customer-only. */
export async function getMyWishlistProductIds(): Promise<Set<string> | null> {
  const context = await getCurrentUser();
  if (!context) return null;

  const supabase = await createClient();
  const wishlist = await getOrCreateDefaultWishlist(supabase, context.user.id);
  return listWishlistProductIds(supabase, wishlist.id);
}

export async function getMyWishlistItems() {
  const context = await getCurrentUser();
  if (!context) return [];

  const supabase = await createClient();
  const wishlist = await getOrCreateDefaultWishlist(supabase, context.user.id);
  return listWishlistItemsWithProducts(supabase, wishlist.id);
}

export async function toggleWishlistItem(
  productId: string,
): Promise<{ error: string } | { wishlisted: boolean }> {
  const context = await getCurrentUser();
  if (!context) return { error: "Sign in to save items to your wishlist." };

  const supabase = await createClient();
  const wishlist = await getOrCreateDefaultWishlist(supabase, context.user.id);
  const productIds = await listWishlistProductIds(supabase, wishlist.id);

  if (productIds.has(productId)) {
    await removeWishlistItem(supabase, wishlist.id, productId);
    return { wishlisted: false };
  }

  await addWishlistItem(supabase, wishlist.id, productId);
  return { wishlisted: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { toggleWishlistItem } from "@/services/wishlist.service";

export type WishlistActionState = { error?: string; wishlisted?: boolean };

export async function toggleWishlistAction(productId: string): Promise<WishlistActionState> {
  const result = await toggleWishlistItem(productId);
  if ("error" in result) return { error: result.error };
  revalidatePath("/", "layout");
  return { wishlisted: result.wishlisted };
}

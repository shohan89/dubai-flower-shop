"use server";

import { revalidatePath } from "next/cache";
import { addToCart, updateCartItem, removeCartItem } from "@/services/cart.service";

export type CartActionState = { error?: string; success?: boolean };

export async function addToCartAction(input: {
  productId: string;
  variantId: string | null;
  quantity: number;
  addonIds?: string[];
}): Promise<CartActionState> {
  const result = await addToCart(input);
  if ("error" in result) return { error: result.error };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCartItemAction(itemId: string, quantity: number): Promise<void> {
  await updateCartItem(itemId, quantity);
  revalidatePath("/", "layout");
}

export async function removeCartItemAction(itemId: string): Promise<void> {
  await removeCartItem(itemId);
  revalidatePath("/", "layout");
}

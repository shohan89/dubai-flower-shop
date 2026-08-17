import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";

type CartRow = Database["public"]["Tables"]["carts"]["Row"];
type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];

export async function getCartByUserId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CartRow | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCartBySessionId(
  supabase: SupabaseClient<Database>,
  sessionId: string,
): Promise<CartRow | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCart(
  supabase: SupabaseClient<Database>,
  input: { userId?: string; sessionId?: string },
): Promise<CartRow> {
  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: input.userId ?? null, session_id: input.sessionId ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export type CartItemWithProduct = CartItemRow & {
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  variantName: string | null;
  currentUnitPrice: string;
  stockQuantity: number;
};

export async function getCartItemsWithProducts(
  supabase: SupabaseClient<Database>,
  cartId: string,
): Promise<CartItemWithProduct[]> {
  const { data: items, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!items || items.length === 0) return [];

  const productIds = Array.from(new Set(items.map((i) => i.product_id)));
  const variantIds = Array.from(
    new Set(items.map((i) => i.variant_id).filter((id): id is string => Boolean(id))),
  );

  const [{ data: products, error: productsError }, { data: variants, error: variantsError }, { data: images, error: imagesError }] =
    await Promise.all([
      supabase.from("products").select("id, name, slug, base_price, stock_quantity").in("id", productIds),
      variantIds.length
        ? supabase.from("product_variants").select("id, name, price_override, stock_quantity").in("id", variantIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("product_images")
        .select("product_id, url, is_primary, variant_id")
        .in("product_id", productIds)
        .is("variant_id", null)
        .eq("is_primary", true),
    ]);
  if (productsError) throw productsError;
  if (variantsError) throw variantsError;
  if (imagesError) throw imagesError;

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));
  const imageMap = new Map((images ?? []).map((img) => [img.product_id, img.url]));

  return items.map((item) => {
    const product = productMap.get(item.product_id);
    const variant = item.variant_id ? variantMap.get(item.variant_id) : undefined;
    return {
      ...item,
      productName: product?.name ?? "Unknown product",
      productSlug: product?.slug ?? "",
      productImageUrl: imageMap.get(item.product_id) ?? null,
      variantName: variant?.name ?? null,
      currentUnitPrice: variant?.price_override ?? product?.base_price ?? "0",
      stockQuantity: variant?.stock_quantity ?? product?.stock_quantity ?? 0,
    };
  });
}

export async function findMatchingCartItem(
  supabase: SupabaseClient<Database>,
  cartId: string,
  productId: string,
  variantId: string | null,
): Promise<CartItemRow | null> {
  let query = supabase.from("cart_items").select("*").eq("cart_id", cartId).eq("product_id", productId);
  query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertCartItem(
  supabase: SupabaseClient<Database>,
  input: {
    cartId: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    unitPriceSnapshot: string;
    selectedAddons: Json;
    giftMessage?: string | null;
    notes?: string | null;
  },
): Promise<CartItemRow> {
  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: input.cartId,
      product_id: input.productId,
      variant_id: input.variantId,
      quantity: input.quantity,
      unit_price_snapshot: input.unitPriceSnapshot,
      selected_addons: input.selectedAddons,
      gift_message: input.giftMessage ?? null,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getCartItemById(
  supabase: SupabaseClient<Database>,
  itemId: string,
): Promise<CartItemRow | null> {
  const { data, error } = await supabase.from("cart_items").select("*").eq("id", itemId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCartItemQuantity(
  supabase: SupabaseClient<Database>,
  itemId: string,
  quantity: number,
): Promise<void> {
  const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  if (error) throw error;
}

export async function deleteCartItem(supabase: SupabaseClient<Database>, itemId: string): Promise<void> {
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw error;
}

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCartSessionId, getOrCreateCartSessionId } from "@/lib/cart-session";
import {
  getCartByUserId,
  getCartBySessionId,
  createCart,
  getCartItemsWithProducts,
  findMatchingCartItem,
  insertCartItem,
  getCartItemById,
  updateCartItemQuantity,
  deleteCartItem,
  type CartItemWithProduct,
} from "@/repositories/cart.repository";

/**
 * Resolves which Supabase client + owner identity to use for the current
 * visitor's cart. Authenticated users get the RLS-scoped request client
 * (their own `carts.user_id = auth.uid()` policy). Guests get the
 * service-role client, scoped manually by the session-id cookie — RLS
 * denies anon direct cart access entirely (see docs/DATABASE.md), so the
 * "authorization" for a guest cart is simply knowing that unguessable
 * cookie value.
 */
async function resolveCartContext(): Promise<{
  supabase: SupabaseClient<Database>;
  userId: string | null;
  sessionId: string | null;
}> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (user) {
    return { supabase: authClient, userId: user.id, sessionId: null };
  }

  const sessionId = await getOrCreateCartSessionId();
  return { supabase: createAdminClient(), userId: null, sessionId };
}

/** Read-only variant — doesn't mint a new guest session cookie just to view an empty cart. */
async function resolveCartContextReadOnly(): Promise<{
  supabase: SupabaseClient<Database>;
  userId: string | null;
  sessionId: string | null;
}> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (user) {
    return { supabase: authClient, userId: user.id, sessionId: null };
  }

  const sessionId = await getCartSessionId();
  return { supabase: createAdminClient(), userId: null, sessionId };
}

async function getOrCreateCartForContext(context: {
  supabase: SupabaseClient<Database>;
  userId: string | null;
  sessionId: string | null;
}) {
  const existing = context.userId
    ? await getCartByUserId(context.supabase, context.userId)
    : context.sessionId
      ? await getCartBySessionId(context.supabase, context.sessionId)
      : null;
  if (existing) return existing;

  return createCart(context.supabase, {
    userId: context.userId ?? undefined,
    sessionId: context.sessionId ?? undefined,
  });
}

export async function getCurrentCartView(): Promise<{
  cartId: string | null;
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
}> {
  const context = await resolveCartContextReadOnly();
  const cart = context.userId
    ? await getCartByUserId(context.supabase, context.userId)
    : context.sessionId
      ? await getCartBySessionId(context.supabase, context.sessionId)
      : null;

  if (!cart) {
    return { cartId: null, items: [], subtotal: 0, itemCount: 0 };
  }

  const items = await getCartItemsWithProducts(context.supabase, cart.id);
  const subtotal = items.reduce((sum, item) => sum + Number(item.unit_price_snapshot) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { cartId: cart.id, items, subtotal, itemCount };
}

export async function addToCart(input: {
  productId: string;
  variantId: string | null;
  quantity: number;
  /** Just ids — prices/names are always resolved server-side below, never trusted from the client. */
  addonIds?: string[];
  giftMessage?: string;
  notes?: string;
}): Promise<{ error: string } | { success: true }> {
  const context = await resolveCartContext();

  // Price and availability are always resolved from the live row, never
  // trusted from the client.
  const { data: product, error: productError } = await context.supabase
    .from("products")
    .select("id, base_price, status, delivery_available, stock_quantity")
    .eq("id", input.productId)
    .maybeSingle();
  if (productError) throw productError;
  if (!product || product.status !== "active") return { error: "This product is not available." };
  if (!product.delivery_available) return { error: "This product isn't currently deliverable." };

  let unitPrice = product.base_price;
  let availableStock = product.stock_quantity;

  if (input.variantId) {
    const { data: variant, error: variantError } = await context.supabase
      .from("product_variants")
      .select("id, price_override, is_active, stock_quantity")
      .eq("id", input.variantId)
      .eq("product_id", input.productId)
      .maybeSingle();
    if (variantError) throw variantError;
    if (!variant || !variant.is_active) return { error: "This option is not available." };
    unitPrice = variant.price_override ?? product.base_price;
    availableStock = variant.stock_quantity;
  }

  if (availableStock <= 0) return { error: "This item is out of stock." };

  let selectedAddons: Json = [];
  if (input.addonIds && input.addonIds.length > 0) {
    // Only addons actually offered on this product are accepted — not
    // just any active addon id.
    const { data: offeredLinks, error: offeredError } = await context.supabase
      .from("product_addons")
      .select("addon_id")
      .eq("product_id", input.productId)
      .in("addon_id", input.addonIds);
    if (offeredError) throw offeredError;
    const offeredIds = new Set((offeredLinks ?? []).map((l) => l.addon_id));

    const { data: addonRows, error: addonsError } = await context.supabase
      .from("addons")
      .select("id, name, price, is_active")
      .in("id", input.addonIds)
      .eq("is_active", true);
    if (addonsError) throw addonsError;

    selectedAddons = (addonRows ?? [])
      .filter((addon) => offeredIds.has(addon.id))
      .map((addon) => ({ addon_id: addon.id, name: addon.name, unit_price_snapshot: addon.price }));
  }

  const cart = await getOrCreateCartForContext(context);
  const existingItem = await findMatchingCartItem(
    context.supabase,
    cart.id,
    input.productId,
    input.variantId,
  );

  if (existingItem) {
    await updateCartItemQuantity(
      context.supabase,
      existingItem.id,
      existingItem.quantity + input.quantity,
    );
  } else {
    await insertCartItem(context.supabase, {
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitPriceSnapshot: unitPrice,
      selectedAddons,
      giftMessage: input.giftMessage,
      notes: input.notes,
    });
  }

  return { success: true };
}

/**
 * For an authenticated user this ownership check is belt-and-braces
 * (RLS already scopes `cart_items` to the caller's own cart). For a
 * guest it's the *only* check: guest carts are mutated through the
 * service-role client, which bypasses RLS entirely, so without this an
 * unguessable item id passed by one visitor could touch another
 * visitor's cart. Throws rather than silently no-op-ing.
 */
async function assertOwnsCartItem(
  context: { supabase: SupabaseClient<Database>; userId: string | null; sessionId: string | null },
  itemId: string,
): Promise<void> {
  const item = await getCartItemById(context.supabase, itemId);
  if (!item) throw new Error("Cart item not found.");

  const cart = context.userId
    ? await getCartByUserId(context.supabase, context.userId)
    : context.sessionId
      ? await getCartBySessionId(context.supabase, context.sessionId)
      : null;

  if (!cart || item.cart_id !== cart.id) {
    throw new Error("You don't have permission to modify this cart item.");
  }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<void> {
  const context = await resolveCartContext();
  await assertOwnsCartItem(context, itemId);
  if (quantity <= 0) {
    await deleteCartItem(context.supabase, itemId);
  } else {
    await updateCartItemQuantity(context.supabase, itemId, quantity);
  }
}

export async function removeCartItem(itemId: string): Promise<void> {
  const context = await resolveCartContext();
  await assertOwnsCartItem(context, itemId);
  await deleteCartItem(context.supabase, itemId);
}

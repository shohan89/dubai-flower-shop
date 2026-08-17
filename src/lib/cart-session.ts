import "server-only";
import { cookies } from "next/headers";

const CART_SESSION_COOKIE = "cart_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Guest cart identity: an unguessable random id stored in a long-lived
 * cookie. RLS denies anon direct access to `carts`/`cart_items` (see
 * docs/DATABASE.md) — guest cart reads/writes go through the
 * service-role client in src/services/cart.service.ts, scoped by this
 * session id acting as a bearer-token-like credential. Never exposed to
 * the client as anything other than an opaque cookie value.
 */
export async function getOrCreateCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
  return sessionId;
}

export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
}

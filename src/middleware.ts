import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";

const PROTECTED_PREFIXES = ["/admin", "/account"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

/**
 * Refreshes the Supabase auth session cookie on every request, and does a
 * cheap "is there a session at all" pre-check for /admin and /account so
 * a signed-out visitor bounces to the right login page immediately.
 *
 * This is a UX fast path only, not the authorization decision: it can't
 * see roles/permissions without an extra query on every request, so the
 * authoritative role/permission check always happens server-side in the
 * relevant layout (src/app/admin/(dashboard)/layout.tsx,
 * src/app/account/layout.tsx) and in every Server Action/Route Handler
 * via requireRole()/requirePermission() — never trust this alone.
 *
 * Deliberately using the legacy `middleware.ts` convention (Edge runtime)
 * instead of Next 16's `proxy.ts`: `proxy.ts` runs on the Node.js runtime
 * only, and @opennextjs/cloudflare (our deployment target) rejects
 * Node-runtime middleware at build time. Revisit once the adapter
 * supports it.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Revalidates the session and refreshes the cookie if needed. Required
  // even though the return value is unused directly below — do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isProtected =
    !isPublicAdminPath && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !user) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};

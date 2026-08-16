# Authentication & Authorization

Supabase Auth (email/password) plus a resource-based permission map for
the six staff/customer roles. See `docs/DATABASE.md` for the underlying
`roles`/`user_roles` schema and RLS policies — this doc covers the
application-layer enforcement on top of that.

## Roles

`super_admin`, `admin`, `manager`, `editor`, `fulfillment`, `customer` —
fixed set, seeded in `supabase/migrations/*_rbac.sql`, mirrored in
`src/constants/roles.ts`. Every new signup gets `customer` automatically
(the `handle_new_user()` trigger); staff roles are assigned in addition
to, not instead of, `customer`.

## Two authorization models, used for different things

**Customer data access is RLS-ownership based, not permission-based.**
A customer's own profile/addresses/orders/wishlist/reviews are governed
entirely by `auth.uid() = user_id` policies in Postgres (see
`docs/DATABASE.md`). There's no "customer" entry in the resource
permission map below — `hasPermission()` always returns `false` for the
`customer` role, by design.

**Staff dashboard access is resource-permission based.**
`src/constants/permissions.ts` defines `PERMISSION_RESOURCES` (products,
inventory, orders, customers, delivery, coupons, homepage, banners,
pages, blog, faq, seo, analytics, settings, users) and `ROLE_PERMISSIONS`,
mapping each staff role to the resources it's granted, exactly per spec:

| Role | Resources |
|---|---|
| `super_admin` | `'all'` — every resource, including ones added later |
| `admin` | products, orders, customers, delivery, coupons, *(content: homepage, banners, pages, blog, faq, seo)*, analytics, settings |
| `manager` | products, orders, inventory, delivery, customers |
| `editor` | homepage, banners, pages, blog, faq, seo |
| `fulfillment` | orders, inventory, delivery |

`admin`'s spec entry lists a single "content" bucket while `editor`'s
lists the six content resources individually — `hasPermission()`
reconciles this by expanding `admin`'s grant to the same six resources
`editor` has, rather than modeling "content" as a distinct concept.

`hasPermission(roles, resource)` and `hasAnyStaffAccess(roles)` are pure
functions — see `src/constants/permissions.test.ts` for the full
role × resource matrix test (96 cases, every role against every
resource).

## The authorization helpers

`src/services/authorization.service.ts` is the one place session/role
checks happen. Never re-implement a role check inline — call these:

```ts
requireAuth(): Promise<AuthContext>              // throws AuthError(401) if signed out
requireRole(roles): Promise<AuthContext>          // throws 401/403; audit-logs denials
requirePermission(resource): Promise<AuthContext> // throws 401/403; audit-logs denials
getCurrentUser(): Promise<AuthContext | null>     // never throws — for conditional UI
```

`AuthContext` is `{ user, roles }`. `AuthError` carries a `status` of
`401` or `403`.

**Two page-level convenience wrappers** catch `AuthError` and `redirect()`
instead of throwing, since Server Components/layouts want a redirect, not
an unhandled exception:

```ts
requireAdminAccess(resource?)  // redirects to /admin/login (401) or /forbidden (403)
requireCustomerAccess()        // redirects to /login (401)
```

`requireAdminAccess()` with no `resource` means "any staff role is
enough" — used once in `src/app/admin/(dashboard)/layout.tsx` to gate the
whole dashboard shell. Individual section pages (once built in later
phases) should call `requireAdminAccess('products')` etc. for
resource-level gating, which also redirects a staff member who's signed
in but lacks that specific permission to `/forbidden` rather than the
generic dashboard.

### Where each variant belongs

- **Server Components (pages/layouts)**: `requireAdminAccess()` /
  `requireCustomerAccess()` — redirect on failure, no error boundary.
- **Server Actions**: call the throwing `requireAuth()`/`requireRole()`/
  `requirePermission()` as the *first* line, regardless of whether the
  page that renders the form already gated access — an action can be
  invoked directly, bypassing the UI. Catch `AuthError` and either
  `redirect()` (if the page context makes that the right UX — see
  `src/app/account/actions.ts`) or return `{ error: error.message }` for
  the form to display.
- **Route Handlers**: same throwing functions; catch `AuthError` and
  return `NextResponse.json({ error: error.message }, { status: error.status })`.

### Middleware is a fast path, never the authorization decision

`src/middleware.ts` does one cheap check: is there a session at all, for
requests under `/admin` (except `/admin/login`) and `/account`. If not,
it redirects immediately — good UX, avoids a wasted render. It does
**not** check roles or permissions (that would mean an extra DB query on
every request to every path under `/admin`), and it is never treated as
sufficient authorization on its own. The authoritative check always
happens server-side in the page/layout and in every Server Action/Route
Handler, per the rule that frontend/edge checks alone are never enough.

## Admin route protection

`/admin/login` is public (its own page, outside the protected route
group). Everything else under `/admin` lives in the
`src/app/admin/(dashboard)/` route group, whose `layout.tsx` calls
`requireAdminAccess()` once — every nested page inherits that gate.
`adminLoginAction` additionally verifies the signed-in account holds at
least one staff role after a successful password check; if not, it signs
the session back out immediately (`This account does not have admin
access.`) rather than leaving a customer-only session that happens to
satisfy the middleware's "is there a session" check.

## Admin shell

`src/components/admin/`: `admin-sidebar.tsx` (desktop, permission-filtered
via `getVisibleAdminNavItems(roles)`), `admin-mobile-nav.tsx` (same nav
list in a `Sheet` drawer), `admin-top-nav.tsx` (composes mobile nav +
breadcrumb + user menu), `admin-breadcrumb.tsx`, `admin-user-menu.tsx`.
The nav item list itself (`src/constants/admin-nav.ts`) intentionally
includes links to sections not built yet (products, orders, …) — they
404 until those phases land; this is how the permission-gated nav is
verified now rather than deferred.

## Audit logging

`public.audit_logs` (append-only, see `docs/DATABASE.md`) is written via
`src/services/audit.service.ts#logAuditEvent()`, which never throws — a
logging failure can't take down the action being audited, it's just
`console.error`'d. Currently logged:

- `authorization_denied` — automatically, from inside `requireRole()`/
  `requirePermission()` on every denial (who, what was required, what
  they actually had).
- `admin_sign_in` — from `adminLoginAction` on a successful staff login.

As later phases add real admin CRUD (products, orders, settings, …),
call `logAuditEvent()` from the relevant service after a privileged
write — see the function's JSDoc for the input shape.

## Email confirmation / password reset links

`src/app/auth/confirm/route.ts` handles Supabase's email action links
(signup confirmation, password recovery) via the `token_hash` + `type`
OTP format, which is what a new Supabase project's default email
templates point at. This wasn't verified against a real inbox — this
environment has no way to receive email. **Verify once deployed**: sign
up with a real address and confirm the link lands on `/auth/confirm` and
redirects correctly; if the project's email templates use a different
link format, they need updating in the Supabase Dashboard (not something
this codebase can configure without dashboard/Management API access).

## Testing

- `src/constants/permissions.test.ts` (`npm run test`) — the full
  role × resource matrix, deterministic, no network.
- Live verification (not part of the repo — a throwaway script run once
  against the real project): created one test user per role via the
  Admin API, assigned roles, signed in as each, and confirmed
  `user_roles` → `roles` resolution and RLS enforcement matched
  expectations for all six roles, then deleted the test users. Re-run
  this style of check manually after any RLS policy change touching
  `roles`/`user_roles`.

# Admin dashboard

Everything under `/admin` (dashboard, products, categories, collections,
add-ons, inventory, orders, customers, coupons, reviews, delivery zones/
slots, settings) follows the layering in `docs/ARCHITECTURE.md` and the
authorization model in `docs/AUTHENTICATION.md`. This doc covers what's
specific to the admin UI itself.

## Reusable component library

`src/components/data-table/` — list pages are Server Components; all
state (search, filters, sort, pagination) lives in the URL, so these
ship with **zero client JS**:

- `DataTable` — generic typed table (`columns`, `rows`, `getRowId`);
  sortable columns compute their header link from `basePath` + the
  current `searchParams`.
- `TableToolbar` — the one `<form method="get">` a page's `SearchInput`
  and `FilterSelect` live inside (forms can't nest, so these are bare
  fields, not each their own form).
- `SearchInput`, `FilterSelect` — plain `<input search>` / native
  `<select>`; submitting the toolbar form is what triggers navigation.
- `Pagination` — prev/next + range, links built the same way.

`src/lib/admin/table-params.ts` has the URL-building helpers
(`getPage`, `getSort`, `buildSortHref`, `buildPageHref`,
`buildFilterHref`) every list page and `DataTable` call into.

`src/components/shared/` — cross-domain UI:

- `Modal`, `Drawer` — thin wrappers over the shadcn `Dialog`/`Sheet`,
  each accepting either a `trigger` element (uncontrolled) or
  `open`/`onOpenChange` (controlled).
- `ConfirmDialog` — "are you sure?" wrapper around a zero-arg async
  action. Supports both modes too — controlled mode exists specifically
  for triggers that can't cleanly nest a `DialogTrigger` (e.g. a
  dropdown menu item, whose own close-on-click would otherwise race the
  dialog opening — see `ProductRowActions`' delete confirmation).
- `FormField`, `SubmitButton` (uses `useFormStatus`), `PriceInput`
  (AED-prefixed numeric input), `StatusBadge` (+ per-domain tone
  mappings in `src/lib/admin/status-tones.ts`).
- `ImageUploader` — uploads directly from the browser to the Supabase
  Storage `media` bucket (not proxied through a Server Action — avoids
  the default request body size limit). Client-side MIME/size checks
  are UX only; the real enforcement is the bucket's server-side
  `file_size_limit`/`allowed_mime_types` and its `is_staff()` RLS policy
  (see `supabase/migrations/*_storage_buckets.sql`).
- `RichTextEditor` — a deliberately lightweight `contentEditable` +
  toolbar editor (bold/italic/lists/link via `document.execCommand`),
  not a full WYSIWYG library. Good enough for product/page descriptions;
  swap for a real editor library if requirements grow (tables, embeds,
  collaborative editing).

## Admin nav vs. permissions

`src/constants/admin-nav.ts` lists every dashboard section with the
`PermissionResource` it requires (or none, for Dashboard); the sidebar,
mobile nav, and breadcrumb all derive from
`getVisibleAdminNavItems(roles)` — a role only ever sees links it can
use. The nav intentionally links to sections not built yet in earlier
phases; unbuilt ones 404 until their phase lands.

## Products

The most detailed domain — see `src/services/product.service.ts` and
`src/components/admin/products/`. Notable decisions:

- **Images and variants require a saved product first.** The "New
  product" page only has the core form; images/variants management
  (`ProductImagesSection`, `ProductVariantsSection`) only appears on the
  edit page, since both need a real `product_id`.
- **Category/collection/add-on assignment replaces the full set** on
  every save (delete-then-insert on the junction tables), not a diff —
  simple and correct for admin-only, low-concurrency edits.
- **Duplicate** copies the product row (new slug/SKU with a `-copy-<ts>`
  suffix, forced back to `draft`/unfeatured) plus its category/
  collection/add-on links; it does not copy images or variants.
- **Quick actions** (publish/unpublish, archive, delete, and the
  featured/bestseller/new-arrival/on-sale toggles) live in
  `ProductRowActions` on the list page, independent of the full edit
  form — either path works, they write the same columns.

## Orders

`src/constants/order-status.ts` defines `ORDER_STATUS_TRANSITIONS` — the
allowed next-status graph (e.g. `pending → confirmed | cancelled`). This
is enforced at the service layer (`transitionOrderStatus`), not the
database — the `orders.status` CHECK constraint only validates the
*value*, not the *transition*. The order detail page's status control
only ever offers the allowed next steps. Every transition is
auto-logged to `order_status_history` by the DB trigger from Phase 2;
`order_status_changed` audit-log entries are written separately by the
admin action for the "who did it, from the dashboard" record.

## Settings

`site_settings`, `store_settings`, `delivery_settings`,
`payment_settings` are DB-enforced singletons (see `docs/DATABASE.md`).
`src/repositories/settings.repository.ts` has one concrete get/save pair
per table rather than a generic `keyof Tables` helper — a generic
version doesn't type-check against the Supabase client's `.from()`
overloads, and four short concrete functions turned out simpler than
fighting that.

## Dashboard

`src/services/dashboard.service.ts` computes every stat (sales totals,
today's orders, status distribution, the 14-day sales chart, top
products) by fetching raw rows and reducing them in application code —
no SQL views or RPCs. Simplest option at this data volume; revisit with
dedicated aggregate views if order volume grows large enough for it to
matter. The sales chart (`src/components/admin/dashboard/sales-chart.tsx`)
is a small hand-rolled SVG line/area chart (hover tooltip, no charting
library dependency) using the brand primary color; order status
distribution reuses the same semantic status-tone system as
`StatusBadge` rather than a separate categorical palette.

## Verification

This phase was checked with `tsc --noEmit` / `eslint` / `next build` /
`vitest run` after every domain, plus two real-browser passes (Supabase
Admin API test users, deleted afterward) using Playwright — one focused
on Products (caught a Base UI `nativeButton` accessibility warning on a
link-styled-as-button, and an ungraceful broken-image state, both fixed),
one sweeping all remaining pages plus the Settings tabs and a drawer
open — zero console/network errors on the final pass.

# Database

Supabase PostgreSQL, managed entirely through versioned migrations in
`supabase/migrations/`. Nothing in this schema is applied by hand —
every table, function, and policy exists because a migration created it.

## Workflow

```bash
# Create a new migration
npx supabase migration new <description>

# Apply migrations to the linked/remote project
npx supabase db push --db-url "$SUPABASE_DB_URL"

# Apply local sample data (see supabase/seed.sql) — local dev only
npx supabase db push --db-url "$SUPABASE_DB_URL" --include-seed

# Regenerate src/types/database.types.ts from the live schema
npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" > src/types/database.types.ts
```

`supabase gen types` and `supabase db dump` require a local Docker/Podman
runtime even when targeting a remote database (the CLI runs a local
introspection container). Where Docker isn't available, `database.types.ts`
was hand-authored directly from the migrations instead — see the file's
header comment. Regenerate it for real once Docker is available; treat
the hand-authored version as provisional.

If `db.<project-ref>.supabase.co` doesn't resolve (it's IPv6-only), use
the connection pooler host instead (`aws-0-<region>.pooler.supabase.com`,
username `postgres.<project-ref>`, from Project Settings → Database →
Connection string → Session pooler) — that's what `SUPABASE_DB_URL` in
`.env.example`/`.env.local` uses.

`supabase/seed.sql` is sample/demo data only (a handful of categories,
products, delivery zones, homepage sections, FAQs, and settings) — never
real orders or customers. It's applied explicitly with `--include-seed`,
never automatically.

**`db push --include-seed` can silently no-op on an edited seed file.**
When `seed.sql` has been applied once before, re-running `db push
--include-seed` after editing it can report `"Updating seed hash..."` /
success without actually re-executing the SQL (observed on CLI 2.114.0,
reproduced twice). If row counts don't change after a seed update,
verify directly — e.g. run the new SQL block through a one-off script
using the `postgres` npm package against `SUPABASE_DB_URL` — rather than
trusting the CLI's reported success.

## Schema domains

Migrations are grouped by domain, applied in this order (each file's
timestamp prefix fixes the order; dependencies always precede dependents):

| Migration | Tables |
|---|---|
| `extensions` | — (enables `pgcrypto` for `gen_random_uuid()`) |
| `helper_functions` | — (`set_updated_at`, `generate_order_number`) |
| `rbac` | `roles`, `user_roles`, `profiles`, `addresses` |
| `catalog_taxonomy` | `categories`, `collections`, `tags`, `addons` |
| `products` | `products`, `product_variants`, `product_images`, `product_categories`, `collection_products`, `product_tags`, `product_addons` |
| `delivery` | `delivery_zones`, `delivery_zone_areas`, `delivery_slots` |
| `coupons` | `coupons`, `coupon_products`, `coupon_categories` |
| `carts` | `carts`, `cart_items` |
| `orders` | `orders`, `order_items`, `order_status_history`, `payments`, `refunds`, `order_deliveries` |
| `inventory` | `inventory`, `inventory_transactions` |
| `wishlists_reviews` | `wishlists`, `wishlist_items`, `reviews` |
| `cms` | `homepage_sections`, `banners`, `pages`, `navigation_menus`, `navigation_items` |
| `blog_faq` | `blog_categories`, `blog_posts`, `faq_categories`, `faqs` |
| `seo_redirects` | `seo_metadata`, `redirects` |
| `settings` | `site_settings`, `store_settings`, `delivery_settings`, `payment_settings`, `social_links` |
| `analytics_events` | `product_views`, `search_events`, `cart_events`, `checkout_events` |
| `audit_logs` | `audit_logs` (Phase 3 — see `docs/AUTHENTICATION.md`) |
| `fix_roles_read_policy` | — (widens `roles` SELECT from staff-only to any authenticated user; a customer resolving their own role name needs to read it too) |

## Design decisions

**Controlled values via `CHECK`, not native enums.** Status-like columns
(`orders.status`, `products.status`, etc.) are `text` with a `CHECK`
constraint listing valid values, rather than Postgres `ENUM` types.
Easier to read in a migration diff, and altering the allowed set is a
plain `ALTER TABLE ... DROP/ADD CONSTRAINT` instead of `ALTER TYPE`.
The trade-off: Supabase's type generator can't turn these into TS literal
unions (it only does that for native enums), so they're typed as `string`
in `database.types.ts` — see each table's migration comment for the
actual allowed set.

**Roles are a table, not an enum**, because `user_roles` is a genuine
many-to-many relationship the RLS policies query directly (`roles`:
`super_admin`, `admin`, `manager`, `editor`, `fulfillment`, `customer`,
seeded in the `rbac` migration).

**Money is `numeric(12,2)`, never floating point**, and PostgREST/Supabase
returns `numeric` columns as **strings** in JSON (not `number`) to avoid
float precision loss — `database.types.ts` reflects this. Parse with a
decimal-safe approach in the service layer, never `parseFloat` followed by
further arithmetic.

**Currency is `AED` everywhere, enforced by a `CHECK (currency = 'AED')`**
on every monetary table. This is deliberately a single-value constraint,
not an open `char(3)`: changing it later (multi-currency) is one
`ALTER TABLE` per table, and until then it's impossible to accidentally
persist a mixed-currency row.

**Orders snapshot everything that must survive later edits.** `orders`
stores customer name/email/phone as of checkout; `order_items` stores
product name/SKU/variant name/image as of checkout; `order_deliveries`
stores the full recipient/address as of checkout (not just an
`address_id`). A product price change, a customer editing their profile,
or an address being deleted never changes a historical order. Orders are
never hard- or soft-deleted — cancellation/refund is represented via
`status`/`payment_status`, consistent with not deleting financial records.

**JSONB is used in exactly four places**, each because the shape
genuinely varies and a relational model would need a near-duplicate table
per variant of the shape, for little query benefit at this stage:
- `product_variants.attributes` — variant option values differ by
  product type (flower size vs. plant pot size vs. color).
- `cart_items.selected_addons` / `order_items.selected_addons` — a small,
  transient (cart) or already-immutable-snapshot (order) list; checkout
  always re-validates pricing server-side regardless of what's stored here.
- `homepage_sections.content` — payload shape varies by `section_type`
  (hero vs. product grid vs. testimonials, …); a CMS layout builder with
  a dedicated table per section type would be significant overhead for
  no relational benefit.
- `seo_metadata.structured_data`, `store_settings.business_hours`,
  analytics event `filters`/`metadata` columns — inherently JSON-shaped
  or small flexible config blobs, not queryable entities.

Everywhere else that could have been JSONB (categories, tags, addons,
delivery areas, navigation, …) is a proper table with real foreign keys.

**Singleton settings tables** (`site_settings`, `store_settings`,
`delivery_settings`, `payment_settings`) are constrained to exactly one
row via `CREATE UNIQUE INDEX ... ON table((true))` — a unique index on a
constant expression. Simpler and more readable than the "boolean primary
key" trick, still enforced by the database rather than by convention.

**Junction/log tables have `created_at` but no `updated_at`.** Rows in
`user_roles`, `product_categories`, `collection_products`, `product_tags`,
`product_addons`, `coupon_products`, `coupon_categories`,
`order_status_history`, `inventory_transactions`, and the analytics event
tables are inserted or deleted, never edited in place — an `updated_at`
column would never change and would misrepresent these as mutable.

**Full-text search is schema-level, not deferred to a later phase.**
`products.search_vector` is a generated, stored `tsvector` column
(weighted: name > short_description > description) with a GIN index, kept
in sync automatically by Postgres — no application-level indexing job.

## RBAC & RLS

Six roles, assigned via `user_roles`. Three SQL helper functions
(`SECURITY DEFINER`, so they work regardless of the caller's own RLS
visibility into `roles`/`user_roles`) back every staff-facing policy:

- `is_staff()` — any of `super_admin, admin, manager, editor, fulfillment`
- `is_management()` — `super_admin, admin, manager`
- `is_super_admin()` — `super_admin` only

**Policy philosophy** (why the policy count per table is smaller than a
full per-role write matrix): staff-initiated writes to admin-managed
tables go through the service-role client (`src/lib/supabase/admin.ts`)
from `src/services/*`, gated by an explicit authorization check in
application code — not through RLS policies granted to `authenticated`.
RLS instead enforces the three things a database is best positioned to
guarantee regardless of what the application code does:

1. **Public read of published storefront data** — active products,
   categories, collections, enabled homepage sections, published pages,
   etc. — gated on `status`/`is_active`/`deleted_at`.
2. **Customers' own data** — `profiles`, `addresses`, `carts`/`cart_items`,
   `wishlists`/`wishlist_items`, `reviews` (submit/edit-while-pending) and
   `orders`/`order_items`/`order_deliveries`/`order_status_history`
   (read-only — creation always goes through a service-layer transaction,
   never a direct client insert) are scoped to `auth.uid()`.
3. **Staff read access** so admin dashboard pages can use the normal
   request-scoped, RLS-respecting server client for simple reads instead
   of always reaching for the service-role client. Financial/sensitive
   tables (`payments`, `refunds`, `inventory`, `coupons` and their scope
   tables) require `is_management()`; `payment_settings` requires
   `is_staff()` for read and is never publicly exposed.

**Guest carts** (no `user_id`, tracked by an opaque `session_id` cookie)
are not reachable via anon RLS at all — there's no way for a Postgres
policy to verify a browser "owns" a given `session_id`. Guest cart
reads/writes go through Server Actions using the service-role client
after the session is validated server-side.

**Coupons are never publicly readable.** Validation happens through a
server action that calls the coupon service — the storefront never
queries `coupons` directly, consistent with never trusting discounts
from the client.

## Database functions

| Function | Purpose |
|---|---|
| `set_updated_at()` | Trigger: keeps `updated_at` current on every `UPDATE`. Attached to every table that has the column. |
| `generate_order_number()` | Returns `DXB-<year>-<6-digit sequence>`, backed by `order_number_seq`. Default for `orders.order_number`. |
| `user_has_role(text[])`, `is_staff()`, `is_management()`, `is_super_admin()` | RBAC checks against `auth.uid()`, used throughout RLS policies. |
| `handle_new_user()` | Trigger on `auth.users`: creates the matching `profiles` row and assigns the default `customer` role. |
| `log_order_status_change()` | Trigger on `orders`: writes a row to `order_status_history` whenever `status` changes. |
| `adjust_inventory(...)` | Atomically updates `inventory.quantity_on_hand` and logs the change to `inventory_transactions` in one call. Runs with the caller's own privileges — trusted server code uses the service-role client; RLS blocks unauthorized callers. |

## Order lifecycle

`orders.status`: `pending → confirmed → preparing → ready_for_delivery →
out_for_delivery → delivered`, with `cancelled`/`refunded` as terminal
alternatives. `orders.payment_status`: `pending → authorized → paid`,
with `failed`/`refunded`/`partially_refunded` as alternatives. Every
`status` change is auto-logged to `order_status_history`; payment history
is separately covered by `payments` (one row per attempt) and `refunds`
(one row per refund), so it isn't duplicated into the status log.

The `total = subtotal - discount_total + delivery_fee + tax_total`
invariant is enforced by a `CHECK` constraint on `orders` — a defense
against application bugs, not a substitute for computing it correctly
server-side in the first place.

## Known limitations

- `database.types.ts` was hand-authored (see above) and omits accurate
  `Relationships` metadata (FK info used for nested `select()` typing) —
  regenerate with real tooling when Docker is available.
- No local Supabase stack (Docker) was available while building this
  schema, so migrations were validated by applying them to the actual
  linked project rather than a disposable local database first.

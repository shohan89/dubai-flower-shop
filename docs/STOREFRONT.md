# Storefront

The customer-facing site, under the `(storefront)` route group
(`src/app/(storefront)/`), sharing one layout (`layout.tsx`): header,
mobile nav, footer, and a sitewide cart drawer.

## Pages

| Route | Purpose |
|---|---|
| `/` | Homepage — entirely database-driven, see below |
| `/shop` | All active products, full filter/sort/pagination |
| `/flowers`, `/plants`, `/gifts` | Same listing UI, pre-filtered by `product_type` |
| `/occasions` | Grid of distinct `products.occasion` values, each linking to `/shop?occasion=…` |
| `/collections` | Grid of active collections, each linking to `/shop?collection=…` (no dedicated collection-detail route was in scope) |
| `/category/[slug]` | Breadcrumb, category hero, filters, sorting, grid, pagination |
| `/product/[slug]` | Gallery, variants, add-ons, quantity, delivery info, add to cart, wishlist, description, care info, reviews, related products |
| `/search` | Keyword search (`search_vector`, websearch-style) plus the same filter set as `/shop` |

`/shop`, `/flowers`, `/plants`, `/gifts`, `/category/[slug]`, and
`/search` all share one rendering pattern
(`src/components/storefront/product-listing-results.tsx` +
`src/lib/storefront/listing-params.ts`) — URL-search-param-driven, no
client JS required for filtering/sorting/pagination, same approach as
the admin `DataTable` (see `docs/ADMIN.md`).

## Homepage sections

`homepage_sections` rows are resolved and rendered generically —
nothing about the homepage layout is hardcoded:

```
getResolvedHomepageSections()   (src/services/homepage.service.ts)
  -> fetches enabled sections, ordered by display_order
  -> per section_type, resolves the extra data that type needs
     (products, categories, addons, faqs, occasions, or the raw
     content JSON for simpler types)
  -> <SectionRenderer> dispatches each resolved section to its
     component (src/components/storefront/sections/*)
```

Twelve section types, each with its own component: `hero`,
`category_grid`, `featured_products`, `bestsellers`,
`trending_products`, `plant_section`, `collection_showcase`,
`occasion`, `promo_banner`, `gift_addons`, `testimonials`, `faq`,
`newsletter`. (`banner_grid`, `custom_html`, `rich_text` exist in the
schema from Phase 2 but have no component yet — `SectionRenderer`
renders nothing for them rather than crashing.)

**`content` JSON conventions per type** (admin editing UI for this is a
later CMS phase — for now, content is authored directly via
`supabase/seed.sql` or SQL):

| Type | `content` shape |
|---|---|
| `hero` | `{ imageUrl?, mobileImageUrl? }` — heading/description/cta come from typed columns |
| `category_grid` | `{ category_slugs?: string[] }` — omitted = first 6 categories |
| `featured_products` / `bestsellers` / `trending_products` / `plant_section` | `{ limit?: number }` (default 8) |
| `collection_showcase` | `{ collection_slug: string, limit?: number }` |
| `testimonials` | `{ testimonials: [{ author, body, rating }] }` — no `testimonials` table exists; curated copy lives directly in this JSON (see docs/DATABASE.md's JSONB rationale) |
| `faq` | `{ faq_category_id?: string }` — omitted = all active FAQs |
| everything else | `{}` (uses typed columns / real tables directly) |

`trending_products` is ordered by `created_at desc` for now — there's no
view-tracking aggregation wired up yet to rank by actual popularity;
`product_views` rows aren't written anywhere in this phase. A real
"most viewed in last N days" query is a reasonable follow-up once
something populates that table.

## Product cards

`src/components/storefront/product-card.tsx` is a Server Component shell
(image, name, price, compare price, badges) with small client islands for
the interactive pieces: `WishlistButton`, `QuickView` (a Dialog using the
already-fetched card data — no extra fetch), `QuickAddButton`. Reused by
grids, carousels (`ProductCarousel`, CSS scroll-snap, no JS library), and
homepage sections.

Broken image URLs (e.g. seed-data placeholders that were never real
files) are handled by `SafeImage`
(`src/components/storefront/safe-image.tsx`) — falls back to an icon
instead of a raw broken-image box. Applied everywhere on the storefront
except the hero background, where a failed image is already an
acceptable no-op (the section's solid `bg-primary` shows through).

## Cart

Guest-friendly by design — no login required to add to cart:

- `src/lib/cart-session.ts` — an opaque, httpOnly `cart_session` cookie
  identifies a guest cart.
- `src/services/cart.service.ts` resolves *which* Supabase client to use
  per request: authenticated visitors get the normal RLS-scoped server
  client (`carts.user_id = auth.uid()`); guests get the service-role
  client, since RLS denies anon direct cart access entirely (see
  docs/DATABASE.md). For guests, **ownership is re-checked in code**
  (`assertOwnsCartItem`) before every mutation — the service-role client
  bypasses RLS, so without this check one visitor's session cookie could
  touch another's cart. This was a real bug caught and fixed while
  building this phase, not a hypothetical.
- Prices are always resolved from the live `products`/`product_variants`
  row when adding to cart, never trusted from the client. Add-on
  selections are sent as bare ids; `addToCart` re-validates each one is
  actually offered on that product (via `product_addons`) and re-prices
  it from `addons` before snapshotting it into `cart_items.selected_addons`.
  `cart_items.unit_price_snapshot` itself remains UI-display-only, as
  documented in the original migration — a future checkout phase must
  recompute the order total from scratch server-side regardless.
- **Client-side gotcha**: `revalidatePath()` (called inside the cart
  Server Actions) invalidates the Next.js data cache but does **not**
  by itself re-render an already-mounted client tree — the cart drawer
  and header badge get their data as props from the `(storefront)`
  layout, which only re-runs on navigation or an explicit
  `router.refresh()`. Every cart-mutating client component
  (`QuickAddButton`, `ProductPurchasePanel`, `CartDrawer`) calls
  `router.refresh()` after a successful mutation for this reason — omit
  it and the UI silently shows stale (often "empty cart") state until
  the next real navigation.

## Wishlist

Authenticated-only (`src/services/wishlist.service.ts`) — a signed-out
visitor clicking the heart is redirected to `/login?next=…`. No
dedicated "view my wishlist" page exists yet in this phase (only the
`customerId`/anonymous distinction and the toggle button on product
cards/detail pages were in scope) — `/account` is the natural place to
add one later.

## Reviews

Storefront-facing review reads/writes live in
`src/repositories/storefront-reviews.repository.ts` and
`src/services/storefront-review.service.ts` — distinct from the admin
moderation repository in `docs/ADMIN.md`. Only `status = 'approved'`
reviews are shown publicly; a signed-in customer's submission goes in as
`status = 'pending'` and needs admin approval before it's visible (see
Reviews in `docs/ADMIN.md`).

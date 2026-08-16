-- Carts and cart line items.
--
-- Guest carts (no user_id, tracked by an opaque session_id) are
-- deliberately not exposed to anon via RLS — there's no reliable way for
-- a Postgres policy to verify a client "owns" a given session_id, since
-- that comes from a cookie, not an authenticated claim. Guest cart reads
-- and writes go through Server Actions using the service-role client
-- after validating the session server-side. Authenticated users' carts
-- are directly readable/writable by the browser client under RLS.

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  status text not null default 'active' check (status in ('active','converted','abandoned')),
  currency text not null default 'AED' check (currency = 'AED'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);

create index carts_user_id_idx on public.carts(user_id);
create index carts_session_id_idx on public.carts(session_id);

create trigger set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

alter table public.carts enable row level security;

create policy "users manage own cart" on public.carts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  -- UI convenience only — never trusted for checkout math. Final prices
  -- are always recalculated server-side from `products`/`product_variants`.
  unit_price_snapshot numeric(12,2) not null check (unit_price_snapshot >= 0),
  -- Chosen add-ons: [{ "addon_id": "...", "quantity": 1, "unit_price_snapshot": 25.00 }].
  -- A real junction table isn't in the requested schema and would add
  -- little here — this list is small, transient, and re-validated
  -- server-side at checkout regardless.
  selected_addons jsonb not null default '[]'::jsonb,
  gift_message text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cart_items_cart_id_idx on public.cart_items(cart_id);
create index cart_items_product_id_idx on public.cart_items(product_id);

create trigger set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

alter table public.cart_items enable row level security;

create policy "users manage own cart items" on public.cart_items
  for all to authenticated
  using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

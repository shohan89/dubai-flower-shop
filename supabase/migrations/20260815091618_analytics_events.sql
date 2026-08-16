-- Lightweight, append-only analytics event logs. No updated_at (events
-- are immutable once recorded). Writable by anon/authenticated (a
-- storefront visitor logs their own browsing/search/cart/checkout
-- events), but a provided user_id must match the caller's own session —
-- nobody can attribute an event to a different user. Readable by staff
-- only; this is internal telemetry, not customer-facing data.

create table public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  referrer text,
  created_at timestamptz not null default now()
);

create index product_views_product_id_idx on public.product_views(product_id, created_at desc);

alter table public.product_views enable row level security;

create policy "anyone can log product views" on public.product_views
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "staff can read product views" on public.product_views
  for select to authenticated
  using (public.is_staff());

create table public.search_events (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  results_count integer not null default 0,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  -- Applied filter state — shape varies with the active filter set.
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index search_events_created_at_idx on public.search_events(created_at desc);

alter table public.search_events enable row level security;

create policy "anyone can log search events" on public.search_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "staff can read search events" on public.search_events
  for select to authenticated
  using (public.is_staff());

create table public.cart_events (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete set null,
  event_type text not null check (event_type in (
    'item_added','item_removed','item_updated','cart_viewed','cart_abandoned'
  )),
  product_id uuid references public.products(id) on delete set null,
  quantity integer,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

create index cart_events_cart_id_idx on public.cart_events(cart_id, created_at desc);

alter table public.cart_events enable row level security;

create policy "anyone can log cart events" on public.cart_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "staff can read cart events" on public.cart_events
  for select to authenticated
  using (public.is_staff());

create table public.checkout_events (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null check (event_type in (
    'checkout_started','address_entered','delivery_selected',
    'payment_selected','order_placed','checkout_abandoned'
  )),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index checkout_events_order_id_idx on public.checkout_events(order_id);
create index checkout_events_created_at_idx on public.checkout_events(created_at desc);

alter table public.checkout_events enable row level security;

create policy "anyone can log checkout events" on public.checkout_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "staff can read checkout events" on public.checkout_events
  for select to authenticated
  using (public.is_staff());

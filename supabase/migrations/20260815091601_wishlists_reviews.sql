-- Wishlists and product reviews.

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Wishlist',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index wishlists_user_id_idx on public.wishlists(user_id);

create trigger set_updated_at
  before update on public.wishlists
  for each row execute function public.set_updated_at();

alter table public.wishlists enable row level security;

create policy "users manage own wishlists" on public.wishlists
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index wishlist_items_wishlist_id_idx on public.wishlist_items(wishlist_id);
create index wishlist_items_product_id_idx on public.wishlist_items(product_id);
-- Dedup that's NULL-safe for variant_id (a plain UNIQUE would treat two
-- NULLs as distinct and allow duplicate product-only entries).
create unique index wishlist_items_unique_entry on public.wishlist_items(
  wishlist_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

alter table public.wishlist_items enable row level security;

create policy "users manage own wishlist items" on public.wishlist_items
  for all to authenticated
  using (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  );

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  -- Kept even if the account is later deleted; author_name is a snapshot.
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  -- Verified-purchase link; optional.
  order_item_id uuid references public.order_items(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index reviews_product_id_idx on public.reviews(product_id) where deleted_at is null;
create index reviews_status_idx on public.reviews(status);

create trigger set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

create policy "public can read approved reviews" on public.reviews
  for select to anon, authenticated
  using (status = 'approved' and deleted_at is null);

create policy "users can read own reviews" on public.reviews
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

create policy "users can submit own reviews" on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "users can edit own pending reviews" on public.reviews
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid());

create policy "users can delete own pending reviews" on public.reviews
  for delete to authenticated
  using (user_id = auth.uid() and status = 'pending');

-- Standalone catalog taxonomy: categories, collections, tags, addons.
-- Products and their junction tables to these are created in the next
-- migration once `products` exists.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index categories_parent_id_idx on public.categories(parent_id);
create index categories_active_idx on public.categories(is_active) where deleted_at is null;

create trigger set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

create policy "public can read active categories" on public.categories
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "staff can read all categories" on public.categories
  for select to authenticated
  using (public.is_staff());

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index collections_active_idx on public.collections(is_active) where deleted_at is null;

create trigger set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

alter table public.collections enable row level security;

create policy "public can read active collections" on public.collections
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "staff can read all collections" on public.collections
  for select to authenticated
  using (public.is_staff());

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "anyone can read tags" on public.tags
  for select to anon, authenticated
  using (true);

-- Standalone add-on items (chocolates, vases, greeting cards, teddy bears, …)
-- offered alongside products via `product_addons`. Deliberately a simpler
-- table than `products` — add-ons don't need variants, flower/plant
-- metadata, or categorization.
create table public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'AED' check (currency = 'AED'),
  image_url text,
  stock_quantity integer check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index addons_active_idx on public.addons(is_active) where deleted_at is null;

create trigger set_updated_at
  before update on public.addons
  for each row execute function public.set_updated_at();

alter table public.addons enable row level security;

create policy "public can read active addons" on public.addons
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "staff can read all addons" on public.addons
  for select to authenticated
  using (public.is_staff());

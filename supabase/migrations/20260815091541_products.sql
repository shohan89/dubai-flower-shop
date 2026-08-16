-- Products, variants, images, and the junction tables linking products to
-- categories, collections, tags, and addons.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  sku text not null unique,
  product_type text not null
    check (product_type in ('flower','bouquet','plant','gift','arrangement','addon')),

  base_price numeric(12,2) not null check (base_price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  cost_price numeric(12,2) check (cost_price >= 0),
  currency text not null default 'AED' check (currency = 'AED'),

  -- Denormalized aggregate stock for quick catalog reads/sorting. The
  -- authoritative, per-variant source of truth is `inventory`; keeping
  -- this in sync is a service-layer responsibility when variants change.
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),

  status text not null default 'draft' check (status in ('draft','active','archived')),
  featured boolean not null default false,
  bestseller boolean not null default false,
  new_arrival boolean not null default false,
  on_sale boolean not null default false,
  delivery_available boolean not null default true,

  -- Flower-specific metadata (null for non-flower product types).
  flower_type text,
  flower_color text,
  stem_count integer check (stem_count >= 0),
  bouquet_size text check (bouquet_size in ('small','medium','large','deluxe')),
  occasion text,
  fragrance text,
  freshness_information text,

  -- Plant-specific metadata (null for non-plant product types).
  plant_type text,
  indoor_outdoor text check (indoor_outdoor in ('indoor','outdoor','both')),
  height_cm numeric(6,2) check (height_cm >= 0),
  pot_size text,
  sunlight text check (sunlight in ('full_sun','partial_sun','shade')),
  watering_frequency text,
  care_level text check (care_level in ('easy','moderate','difficult')),
  pot_included boolean,
  care_instructions text,

  -- Full-text search over name/short description/description, weighted.
  -- A generated column keeps it always in sync without an app-level job.
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index products_status_idx on public.products(status) where deleted_at is null;
create index products_product_type_idx on public.products(product_type) where deleted_at is null;
create index products_featured_idx on public.products(featured) where deleted_at is null and featured;
create index products_bestseller_idx on public.products(bestseller) where deleted_at is null and bestseller;
create index products_new_arrival_idx on public.products(new_arrival) where deleted_at is null and new_arrival;
create index products_on_sale_idx on public.products(on_sale) where deleted_at is null and on_sale;
create index products_search_vector_idx on public.products using gin(search_vector);

create trigger set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "public can read active products" on public.products
  for select to anon, authenticated
  using (status = 'active' and deleted_at is null);

create policy "staff can read all products" on public.products
  for select to authenticated
  using (public.is_staff());

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  name text not null,
  price_override numeric(12,2) check (price_override >= 0),
  compare_at_price_override numeric(12,2) check (compare_at_price_override >= 0),
  -- Variant-defining option values, e.g. {"size":"Large","color":"Red"}.
  -- Shape varies per product_type (flower size vs. pot size vs. color), so
  -- a fully relational option/option-value model would need per-type
  -- tables for little benefit at this scale — genuinely justified JSONB.
  attributes jsonb not null default '{}'::jsonb,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_default boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index product_variants_product_id_idx on public.product_variants(product_id);
create unique index product_variants_one_default_per_product on public.product_variants(product_id)
  where is_default and deleted_at is null;

create trigger set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;

create policy "public can read active variants" on public.product_variants
  for select to anon, authenticated
  using (
    is_active and deleted_at is null
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active' and p.deleted_at is null
    )
  );

create policy "staff can read all variants" on public.product_variants
  for select to authenticated
  using (public.is_staff());

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images(product_id);
create index product_images_variant_id_idx on public.product_images(variant_id);
create unique index product_images_one_primary_per_product on public.product_images(product_id)
  where is_primary and variant_id is null;

alter table public.product_images enable row level security;

create policy "public can read product images" on public.product_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active' and p.deleted_at is null
    )
  );

create policy "staff can read all product images" on public.product_images
  for select to authenticated
  using (public.is_staff());

-- Junction: products <-> categories (many-to-many; a product may sit in
-- both a type category and an occasion category).
create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index product_categories_category_id_idx on public.product_categories(category_id);

alter table public.product_categories enable row level security;

create policy "anyone can read product-category links" on public.product_categories
  for select to anon, authenticated
  using (true);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create index collection_products_product_id_idx on public.collection_products(product_id);

alter table public.collection_products enable row level security;

create policy "anyone can read collection-product links" on public.collection_products
  for select to anon, authenticated
  using (true);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create index product_tags_tag_id_idx on public.product_tags(tag_id);

alter table public.product_tags enable row level security;

create policy "anyone can read product-tag links" on public.product_tags
  for select to anon, authenticated
  using (true);

create table public.product_addons (
  product_id uuid not null references public.products(id) on delete cascade,
  addon_id uuid not null references public.addons(id) on delete cascade,
  is_default boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, addon_id)
);

create index product_addons_addon_id_idx on public.product_addons(addon_id);

alter table public.product_addons enable row level security;

create policy "anyone can read product-addon links" on public.product_addons
  for select to anon, authenticated
  using (true);

-- Homepage builder, banners, static pages, and navigation menus.
-- All fully database-driven — nothing here is hardcoded in the app.

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_type text not null check (section_type in (
    'hero','featured_products','category_grid','collection_showcase',
    'banner_grid','testimonials','newsletter','custom_html','rich_text'
  )),
  heading text,
  subheading text,
  description text,
  cta_text text,
  cta_url text,
  layout text,
  background_style text,
  -- Section-type-specific payload: selected product/category/collection
  -- ids, image lists, per-type settings. Shape genuinely varies by
  -- section_type; a fully relational model would need a near-duplicate
  -- join table per section type for a CMS layout builder — not
  -- justified at this phase. This is the intentional JSONB use case.
  content jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index homepage_sections_enabled_idx on public.homepage_sections(is_enabled, display_order)
  where deleted_at is null;

create trigger set_updated_at
  before update on public.homepage_sections
  for each row execute function public.set_updated_at();

alter table public.homepage_sections enable row level security;

create policy "public can read enabled homepage sections" on public.homepage_sections
  for select to anon, authenticated
  using (is_enabled and deleted_at is null);

create policy "staff can read all homepage sections" on public.homepage_sections
  for select to authenticated
  using (public.is_staff());

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  mobile_image_url text,
  cta_text text,
  cta_url text,
  placement text not null check (placement in (
    'homepage_hero','homepage_secondary','category_top','sitewide_announcement'
  )),
  display_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index banners_placement_idx on public.banners(placement, display_order) where deleted_at is null;

create trigger set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

create policy "public can read active banners" on public.banners
  for select to anon, authenticated
  using (
    is_active and deleted_at is null
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "staff can read all banners" on public.banners
  for select to authenticated
  using (public.is_staff());

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index pages_status_idx on public.pages(status) where deleted_at is null;

create trigger set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

alter table public.pages enable row level security;

create policy "public can read published pages" on public.pages
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

create policy "staff can read all pages" on public.pages
  for select to authenticated
  using (public.is_staff());

create table public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text not null check (location in ('header','footer','mobile')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.navigation_menus
  for each row execute function public.set_updated_at();

alter table public.navigation_menus enable row level security;

create policy "anyone can read navigation menus" on public.navigation_menus
  for select to anon, authenticated
  using (true);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.navigation_menus(id) on delete cascade,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  label text not null,
  url text,
  link_type text not null default 'custom' check (link_type in ('custom','category','collection','page','product')),
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  page_id uuid references public.pages(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index navigation_items_menu_id_idx on public.navigation_items(menu_id, display_order);
create index navigation_items_parent_id_idx on public.navigation_items(parent_id);

create trigger set_updated_at
  before update on public.navigation_items
  for each row execute function public.set_updated_at();

alter table public.navigation_items enable row level security;

create policy "anyone can read active navigation items" on public.navigation_items
  for select to anon, authenticated
  using (is_active);

create policy "staff can read all navigation items" on public.navigation_items
  for select to authenticated
  using (public.is_staff());

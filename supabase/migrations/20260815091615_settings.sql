-- Site-wide configuration. `site_settings`, `store_settings`, and
-- `delivery_settings` are each constrained to a single row via a unique
-- index on a constant expression — a standard, readable Postgres
-- singleton pattern (avoids the confusing "boolean primary key" trick
-- while still being enforced by the database, not convention).

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Dubai Flower Shop',
  site_description text,
  logo_url text,
  favicon_url text,
  default_seo_title text,
  default_seo_description text,
  default_og_image_url text,
  contact_email text,
  contact_phone text,
  maintenance_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index site_settings_singleton on public.site_settings((true));

create trigger set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

-- Public-facing branding/SEO defaults — the storefront needs these for
-- anonymous visitors (logo, site name, default meta tags).
create policy "anyone can read site settings" on public.site_settings
  for select to anon, authenticated
  using (true);

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  default_currency text not null default 'AED' check (default_currency = 'AED'),
  order_number_prefix text not null default 'DXB',
  -- Small, inherently flexible weekly schedule blob, e.g. {"mon":"9:00-21:00",...}.
  business_hours jsonb not null default '{}'::jsonb,
  whatsapp_number text,
  support_email text,
  support_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index store_settings_singleton on public.store_settings((true));

create trigger set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

create policy "anyone can read store settings" on public.store_settings
  for select to anon, authenticated
  using (true);

create table public.delivery_settings (
  id uuid primary key default gen_random_uuid(),
  default_currency text not null default 'AED' check (default_currency = 'AED'),
  free_delivery_threshold numeric(12,2) check (free_delivery_threshold >= 0),
  same_day_cutoff_time time,
  default_delivery_fee numeric(12,2) not null default 0 check (default_delivery_fee >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index delivery_settings_singleton on public.delivery_settings((true));

create trigger set_updated_at
  before update on public.delivery_settings
  for each row execute function public.set_updated_at();

alter table public.delivery_settings enable row level security;

create policy "anyone can read delivery settings" on public.delivery_settings
  for select to anon, authenticated
  using (true);

create table public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  cod_enabled boolean not null default true,
  card_enabled boolean not null default true,
  enabled_providers text[] not null default array[]::text[],
  test_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index payment_settings_singleton on public.payment_settings((true));

create trigger set_updated_at
  before update on public.payment_settings
  for each row execute function public.set_updated_at();

alter table public.payment_settings enable row level security;

-- Not publicly readable — checkout payment method availability is served
-- through a dedicated server action, not a direct read of this table.
create policy "staff can read payment settings" on public.payment_settings
  for select to authenticated
  using (public.is_staff());

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique check (platform in (
    'instagram','facebook','tiktok','whatsapp','twitter','youtube','pinterest','snapchat'
  )),
  url text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

alter table public.social_links enable row level security;

create policy "anyone can read active social links" on public.social_links
  for select to anon, authenticated
  using (is_active);

create policy "staff can read all social links" on public.social_links
  for select to authenticated
  using (public.is_staff());

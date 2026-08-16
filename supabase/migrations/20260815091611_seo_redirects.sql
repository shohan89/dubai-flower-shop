-- Generic per-entity SEO metadata overrides, and legacy URL redirects.

create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('product','category','collection','page','blog_post','home')),
  -- Null only for entity_type = 'home' (the site-wide homepage SEO singleton).
  entity_id uuid,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  robots_directives text not null default 'index,follow',
  -- schema.org JSON-LD overrides — inherently JSON-shaped, justified JSONB.
  structured_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index seo_metadata_entity_unique on public.seo_metadata(entity_type, entity_id)
  where entity_id is not null;
create unique index seo_metadata_home_singleton on public.seo_metadata(entity_type)
  where entity_type = 'home';

create trigger set_updated_at
  before update on public.seo_metadata
  for each row execute function public.set_updated_at();

alter table public.seo_metadata enable row level security;

create policy "anyone can read seo metadata" on public.seo_metadata
  for select to anon, authenticated
  using (true);

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301 check (status_code in (301, 302, 307, 308)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index redirects_active_idx on public.redirects(is_active);

create trigger set_updated_at
  before update on public.redirects
  for each row execute function public.set_updated_at();

alter table public.redirects enable row level security;

create policy "anyone can read active redirects" on public.redirects
  for select to anon, authenticated
  using (is_active);

create policy "staff can read all redirects" on public.redirects
  for select to authenticated
  using (public.is_staff());

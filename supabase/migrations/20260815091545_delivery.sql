-- Delivery zones, their areas, and delivery time slots.
--
-- Slots are modeled as a global set of time windows (not per-zone) since
-- the admin dashboard treats "Delivery Zones" and "Delivery Slots" as
-- separate sections; a zone's own fee/minimum-order/same-day settings
-- combine with a slot's extra fee at checkout (see `order_deliveries` in
-- the orders migration for how a specific order combines the two).

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  base_delivery_fee numeric(12,2) not null default 0 check (base_delivery_fee >= 0),
  minimum_order_amount numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  currency text not null default 'AED' check (currency = 'AED'),
  same_day_available boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index delivery_zones_active_idx on public.delivery_zones(is_active) where deleted_at is null;

create trigger set_updated_at
  before update on public.delivery_zones
  for each row execute function public.set_updated_at();

alter table public.delivery_zones enable row level security;

create policy "public can read active delivery zones" on public.delivery_zones
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "staff can read all delivery zones" on public.delivery_zones
  for select to authenticated
  using (public.is_staff());

create table public.delivery_zone_areas (
  id uuid primary key default gen_random_uuid(),
  delivery_zone_id uuid not null references public.delivery_zones(id) on delete cascade,
  area_name text not null,
  postcode text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (delivery_zone_id, area_name)
);

create index delivery_zone_areas_zone_id_idx on public.delivery_zone_areas(delivery_zone_id);

create trigger set_updated_at
  before update on public.delivery_zone_areas
  for each row execute function public.set_updated_at();

alter table public.delivery_zone_areas enable row level security;

create policy "public can read active delivery zone areas" on public.delivery_zone_areas
  for select to anon, authenticated
  using (is_active);

create policy "staff can read all delivery zone areas" on public.delivery_zone_areas
  for select to authenticated
  using (public.is_staff());

create table public.delivery_slots (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_time time not null,
  end_time time not null,
  is_same_day boolean not null default false,
  extra_fee numeric(12,2) not null default 0 check (extra_fee >= 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index delivery_slots_active_idx on public.delivery_slots(is_active);

create trigger set_updated_at
  before update on public.delivery_slots
  for each row execute function public.set_updated_at();

alter table public.delivery_slots enable row level security;

create policy "public can read active delivery slots" on public.delivery_slots
  for select to anon, authenticated
  using (is_active);

create policy "staff can read all delivery slots" on public.delivery_slots
  for select to authenticated
  using (public.is_staff());

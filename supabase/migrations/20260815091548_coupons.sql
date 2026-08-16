-- Coupons and their optional product/category scoping.
--
-- Deliberately no public SELECT policy: coupon codes are validated
-- server-side (a Server Action calls the coupon service, which is the
-- only thing allowed to read this table for validation) — the storefront
-- never queries `coupons` directly, matching the rule that discounts are
-- never trusted from the client.

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed_amount')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  currency text not null default 'AED' check (currency = 'AED'),
  minimum_order_amount numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  usage_limit integer check (usage_limit > 0),
  usage_limit_per_customer integer check (usage_limit_per_customer > 0),
  times_used integer not null default 0 check (times_used >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (discount_type <> 'percentage' or discount_value <= 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create unique index coupons_code_upper_idx on public.coupons (upper(code));
create index coupons_active_idx on public.coupons(is_active) where deleted_at is null;

create trigger set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

alter table public.coupons enable row level security;

create policy "management can read coupons" on public.coupons
  for select to authenticated
  using (public.is_management());

-- Scope restriction: if a coupon has no rows in either junction table it
-- applies store-wide; otherwise it's restricted to the listed
-- products/categories. Enforced by the coupon service, not the database.
create table public.coupon_products (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coupon_id, product_id)
);

alter table public.coupon_products enable row level security;

create policy "management can read coupon product scope" on public.coupon_products
  for select to authenticated
  using (public.is_management());

create table public.coupon_categories (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coupon_id, category_id)
);

alter table public.coupon_categories enable row level security;

create policy "management can read coupon category scope" on public.coupon_categories
  for select to authenticated
  using (public.is_management());

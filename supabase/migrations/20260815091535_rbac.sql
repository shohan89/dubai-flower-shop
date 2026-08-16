-- Roles, role assignment, profiles, and addresses.
--
-- Role model: a fixed set of six roles (seeded below). `user_roles` is a
-- many-to-many join so a user could in principle hold more than one role,
-- though the admin UI is expected to assign exactly one.
--
-- RLS philosophy used throughout this schema (see docs/DATABASE.md for the
-- full write-up): staff-initiated writes to admin-managed tables go
-- through the service-role client from `src/services/*`, gated by an
-- explicit authorization check in application code — not through RLS
-- policies granted to the `authenticated` role. RLS here instead enforces:
--   1) public read of published storefront data,
--   2) customers' own data (read/write scoped to auth.uid()),
--   3) staff read access for tables the admin dashboard queries directly
--      through the request-scoped (RLS-respecting) server client.
-- This keeps the policy surface small and puts the one enforcement point
-- that matters most (privileged writes) in code that's easier to review
-- and test than a 55-table policy matrix.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.roles is
  'Fixed set of staff/customer roles. Seeded below; not intended to be edited via the storefront.';

create trigger set_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create index user_roles_user_id_idx on public.user_roles(user_id);
create index user_roles_role_id_idx on public.user_roles(role_id);

-- RBAC helper functions. SECURITY DEFINER so they can read user_roles/roles
-- regardless of the caller's own RLS visibility into those tables (avoids
-- a chicken-and-egg problem when policies on other tables call these).
-- `set search_path` pins name resolution and is required by Supabase's
-- linter for SECURITY DEFINER functions.
create or replace function public.user_has_role(_role_names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = any(_role_names)
  );
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_has_role(array['super_admin','admin','manager','editor','fulfillment']);
$$;

create or replace function public.is_management()
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_has_role(array['super_admin','admin','manager']);
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_has_role(array['super_admin']);
$$;

alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

create policy "staff can read roles" on public.roles
  for select to authenticated
  using (public.is_staff());

create policy "users can read own role assignments" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

-- profiles: one row per auth user, created by the trigger below.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  default_locale text not null default 'en-AE',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "users can read own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy "users can update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Creates a profile row (and default 'customer' role) whenever a new
-- Supabase Auth user is created. SECURITY DEFINER because the inserting
-- session (the auth system itself) has no RLS grant on these tables.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');

  select id into customer_role_id from public.roles where name = 'customer';
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- addresses: customer-owned delivery addresses.
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  emirate text not null default 'Dubai',
  area text not null,
  building text,
  apartment text,
  street text,
  landmark text,
  city text not null default 'Dubai',
  country text not null default 'AE',
  is_default boolean not null default false,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index addresses_user_id_idx on public.addresses(user_id) where deleted_at is null;
-- At most one default, non-deleted address per user.
create unique index addresses_one_default_per_user on public.addresses(user_id)
  where is_default and deleted_at is null;

create trigger set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

create policy "users manage own addresses" on public.addresses
  for all to authenticated
  using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid());

-- Seed the fixed role set. Structural data required in every environment,
-- not demo/sample content, so it ships in a migration rather than seed.sql.
insert into public.roles (name, description) values
  ('super_admin', 'Full platform access, including role and settings management.'),
  ('admin', 'Full operational access to catalog, orders, CMS, and customers.'),
  ('manager', 'Operational management: orders, inventory, coupons, customers.'),
  ('editor', 'Content management: catalog, CMS, blog, and SEO.'),
  ('fulfillment', 'Order preparation and delivery dispatch.'),
  ('customer', 'Default role for storefront accounts.')
on conflict (name) do nothing;

-- Inventory tracking (authoritative per-product/variant stock) and its
-- audit trail, plus a helper function for atomic, logged adjustments.

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  -- Null variant_id = inventory tracked at product level (no variants).
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_available integer generated always as (quantity_on_hand - quantity_reserved) stored,
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (quantity_reserved <= quantity_on_hand)
);

-- One inventory row per product (when untracked by variant) or per
-- product+variant. Partial unique indexes because a plain UNIQUE
-- constraint would treat every NULL variant_id as distinct, allowing
-- duplicate product-level rows.
create unique index inventory_one_row_per_product on public.inventory(product_id)
  where variant_id is null;
create unique index inventory_one_row_per_variant on public.inventory(product_id, variant_id)
  where variant_id is not null;
create index inventory_variant_id_idx on public.inventory(variant_id);

create trigger set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

alter table public.inventory enable row level security;

create policy "management can read inventory" on public.inventory
  for select to authenticated
  using (public.is_management());

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory(id) on delete cascade,
  quantity_delta integer not null,
  reason text not null check (reason in (
    'purchase_order','sale','return','adjustment','damaged','initial_stock'
  )),
  -- Polymorphic reference (e.g. an order) without a strict FK, since the
  -- source of a transaction varies and most sources shouldn't force a
  -- hard dependency on this audit table.
  reference_type text,
  reference_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_transactions_inventory_id_idx on public.inventory_transactions(inventory_id);
create index inventory_transactions_reference_idx on public.inventory_transactions(reference_type, reference_id);

alter table public.inventory_transactions enable row level security;

create policy "management can read inventory transactions" on public.inventory_transactions
  for select to authenticated
  using (public.is_management());

-- Atomically adjusts stock and logs the transaction. Runs with the
-- caller's own privileges (not SECURITY DEFINER): callers are expected to
-- be trusted server code using the service-role client, or the RLS on
-- `inventory` blocks the UPDATE and this raises "not found".
create or replace function public.adjust_inventory(
  _inventory_id uuid,
  _quantity_delta integer,
  _reason text,
  _reference_type text default null,
  _reference_id uuid default null,
  _created_by uuid default null
)
returns public.inventory
language plpgsql
as $$
declare
  updated_row public.inventory;
begin
  update public.inventory
  set quantity_on_hand = quantity_on_hand + _quantity_delta
  where id = _inventory_id
  returning * into updated_row;

  if not found then
    raise exception 'Inventory row % not found or not permitted', _inventory_id;
  end if;

  insert into public.inventory_transactions (
    inventory_id, quantity_delta, reason, reference_type, reference_id, created_by
  ) values (
    _inventory_id, _quantity_delta, _reason, _reference_type, _reference_id, _created_by
  );

  return updated_row;
end;
$$;

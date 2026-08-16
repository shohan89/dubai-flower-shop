-- Orders and everything that belongs to an order: line items, status
-- history, payments, refunds, and delivery details.
--
-- Orders never reference live customer/product state as the source of
-- truth for what was actually purchased — `orders` snapshots the
-- customer's contact details and `order_items`/`order_deliveries`
-- snapshot product and address details, so a later product edit,
-- address edit, or account deletion never changes historical orders.
-- Orders are never hard- or soft-deleted (rule: don't delete financial
-- records) — cancellation/refund is represented via `status`.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  user_id uuid references auth.users(id) on delete set null,

  status text not null default 'pending' check (status in (
    'pending','confirmed','preparing','ready_for_delivery',
    'out_for_delivery','delivered','cancelled','refunded'
  )),
  payment_status text not null default 'pending' check (payment_status in (
    'pending','authorized','paid','failed','refunded','partially_refunded'
  )),
  currency text not null default 'AED' check (currency = 'AED'),

  -- Customer snapshot — immutable, supports guest checkout (user_id null).
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,

  -- Server-calculated pricing (never accepted from the client).
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_total numeric(12,2) not null default 0 check (discount_total >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  tax_total numeric(12,2) not null default 0 check (tax_total >= 0),
  total numeric(12,2) not null check (total >= 0),

  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text,

  gift_message text,
  order_notes text,

  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (total = subtotal - discount_total + delivery_fee + tax_total)
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_payment_status_idx on public.orders(payment_status);
create index orders_placed_at_idx on public.orders(placed_at desc);

create trigger set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy "customers can read own orders" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

-- Order creation/mutation always goes through a service-layer function
-- using the service-role client (needs a multi-step transaction: price
-- calculation, inventory reservation, order + order_items insert). No
-- INSERT/UPDATE policy is granted here on purpose.

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,

  -- Snapshots — the historical record shown to the customer/admin never
  -- changes even if the product is edited, repriced, or deleted later.
  product_name_snapshot text not null,
  product_sku_snapshot text not null,
  variant_name_snapshot text,
  product_image_url_snapshot text,

  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_subtotal numeric(12,2) not null check (line_subtotal >= 0),
  selected_addons jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),

  check (line_subtotal = unit_price * quantity)
);

create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

alter table public.order_items enable row level security;

create policy "customers can read own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );

-- Auto-logged order status transitions (fulfillment status only —
-- payment history is separately covered by `payments`/`refunds`, each
-- attempt/refund being its own auditable row).
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_status_history_order_id_idx on public.order_status_history(order_id);

alter table public.order_status_history enable row level security;

create policy "customers can read own order status history" on public.order_status_history
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_status_history (order_id, previous_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_log_status_change
  after update on public.orders
  for each row execute function public.log_order_status_change();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  -- Left as open text rather than a fixed check list: the payment
  -- provider integration is decided at the service layer (behind a
  -- payment-service interface) in a later phase, not by this schema.
  provider text not null,
  status text not null default 'pending' check (status in (
    'pending','authorized','paid','failed','refunded','partially_refunded'
  )),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'AED' check (currency = 'AED'),
  provider_reference text,
  provider_metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments(order_id);

create trigger set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

create policy "management can read payments" on public.payments
  for select to authenticated
  using (public.is_management());

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'AED' check (currency = 'AED'),
  reason text,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  provider_reference text,
  processed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index refunds_order_id_idx on public.refunds(order_id);

create trigger set_updated_at
  before update on public.refunds
  for each row execute function public.set_updated_at();

alter table public.refunds enable row level security;

create policy "management can read refunds" on public.refunds
  for select to authenticated
  using (public.is_management());

-- One delivery record per order. Address/recipient fields are snapshotted
-- (not just an address_id FK) for the same immutability reason as
-- order_items, and to support guest checkout where no saved address exists.
create table public.order_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
  delivery_slot_id uuid references public.delivery_slots(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,

  recipient_name text not null,
  recipient_phone text not null,
  emirate text not null default 'Dubai',
  area text not null,
  building text,
  apartment text,
  street text,
  landmark text,

  delivery_date date not null,
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  status text not null default 'pending' check (status in ('pending','out_for_delivery','delivered','failed')),
  tracking_notes text,
  delivered_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index order_deliveries_zone_id_idx on public.order_deliveries(delivery_zone_id);
create index order_deliveries_slot_id_idx on public.order_deliveries(delivery_slot_id);
create index order_deliveries_delivery_date_idx on public.order_deliveries(delivery_date);

create trigger set_updated_at
  before update on public.order_deliveries
  for each row execute function public.set_updated_at();

alter table public.order_deliveries enable row level security;

create policy "customers can read own order deliveries" on public.order_deliveries
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
    )
  );

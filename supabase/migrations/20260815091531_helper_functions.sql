-- Generic helper functions used across later migrations.

-- Keeps `updated_at` accurate on every UPDATE. Attached as a BEFORE UPDATE
-- trigger to every table that has an `updated_at` column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Human-readable, sequential order numbers: DXB-<year>-<6-digit sequence>.
-- The sequence is global (not per-year) so numbers never collide even
-- across a year boundary; the year in the label is cosmetic.
create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'DXB-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 6, '0');
end;
$$;

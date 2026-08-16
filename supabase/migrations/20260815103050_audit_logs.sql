-- Audit trail for privileged admin actions (role/permission denials,
-- admin sign-ins, and — as later feature phases land — writes to
-- orders/settings/etc). Append-only: no updated_at, no delete policy.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  -- Snapshot, not just a join through actor_id: stays readable even if
  -- the acting account is later deleted.
  actor_email text,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index audit_logs_resource_idx on public.audit_logs(resource_type, resource_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

-- Any authenticated staff member may append an audit row for their own
-- actions (low-risk: it's an append-only trail, not a data mutation).
create policy "staff can insert own audit logs" on public.audit_logs
  for insert to authenticated
  with check (actor_id = auth.uid() and public.is_staff());

-- Reading the audit trail is management-only, same tier as
-- payments/refunds/inventory.
create policy "management can read audit logs" on public.audit_logs
  for select to authenticated
  using (public.is_management());

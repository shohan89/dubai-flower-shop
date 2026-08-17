-- Phase 5's NewsletterSection needs somewhere real to store signups —
-- not anticipated by the original Phase 2 schema (marketing_opt_in on
-- `profiles` only covers signed-in customers, not anonymous visitors,
-- who are the majority of newsletter signups on a real storefront).

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index newsletter_subscribers_active_idx on public.newsletter_subscribers(is_active);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe; nobody (not even the subscriber) can read the
-- list back — this is a write-only public form, matching how newsletter
-- signup works everywhere. Staff read it via the service-role client
-- from an admin export/report if that's ever built.
create policy "anyone can subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

create policy "management can read subscribers" on public.newsletter_subscribers
  for select to authenticated
  using (public.is_management());

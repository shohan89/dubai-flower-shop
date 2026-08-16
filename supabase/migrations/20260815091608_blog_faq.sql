-- Blog and FAQ content.

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.blog_categories
  for each row execute function public.set_updated_at();

alter table public.blog_categories enable row level security;

create policy "anyone can read blog categories" on public.blog_categories
  for select to anon, authenticated
  using (true);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  cover_image_url text,
  author_id uuid references auth.users(id) on delete set null,
  blog_category_id uuid references public.blog_categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index blog_posts_status_idx on public.blog_posts(status) where deleted_at is null;
create index blog_posts_category_idx on public.blog_posts(blog_category_id);

create trigger set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

create policy "public can read published blog posts" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

create policy "staff can read all blog posts" on public.blog_posts
  for select to authenticated
  using (public.is_staff());

create table public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.faq_categories
  for each row execute function public.set_updated_at();

alter table public.faq_categories enable row level security;

create policy "anyone can read faq categories" on public.faq_categories
  for select to anon, authenticated
  using (true);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  faq_category_id uuid references public.faq_categories(id) on delete set null,
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_category_idx on public.faqs(faq_category_id, display_order);

create trigger set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

create policy "public can read active faqs" on public.faqs
  for select to anon, authenticated
  using (is_active);

create policy "staff can read all faqs" on public.faqs
  for select to authenticated
  using (public.is_staff());

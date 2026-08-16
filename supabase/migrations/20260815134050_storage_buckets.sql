-- Storage bucket for product/category/collection/banner/blog images.
-- One shared "media" bucket is deliberately simpler than one bucket per
-- entity — content lives under path prefixes instead (see
-- src/services/media.service.ts). Public read (storefront images need
-- to render for anon visitors); writes are staff-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "public can read media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

create policy "staff can upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

create policy "staff can update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

create policy "staff can delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());

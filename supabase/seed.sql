-- Sample development data — categories, products, delivery zones, and
-- homepage sections to make the storefront/admin renderable locally.
-- Only loaded by `supabase db reset` (local dev); never applied to a
-- remote project automatically. Deliberately excludes anything that
-- looks like real orders or customers.

-- Categories -----------------------------------------------------------
insert into public.categories (name, slug, description, display_order, is_active) values
  ('Flowers', 'flowers', 'Fresh cut flowers and bouquets', 1, true),
  ('Plants', 'plants', 'Indoor and outdoor plants', 2, true),
  ('Gifts', 'gifts', 'Gifts and add-ons to pair with any order', 3, true)
on conflict (slug) do nothing;

insert into public.categories (parent_id, name, slug, description, display_order, is_active)
select id, 'Roses', 'roses', 'Rose bouquets and arrangements', 1, true
from public.categories where slug = 'flowers'
on conflict (slug) do nothing;

insert into public.categories (parent_id, name, slug, description, display_order, is_active)
select id, 'Succulents', 'succulents', 'Low-maintenance succulents', 1, true
from public.categories where slug = 'plants'
on conflict (slug) do nothing;

-- Collections ------------------------------------------------------------
insert into public.collections (name, slug, description, is_active, display_order) values
  ('Best Sellers', 'best-sellers', 'Our most-loved arrangements', true, 1),
  ('New Arrivals', 'new-arrivals', 'Freshly added to the shop', true, 2)
on conflict (slug) do nothing;

-- Products: flowers -------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, sku, product_type,
  base_price, compare_at_price, cost_price, stock_quantity, low_stock_threshold,
  status, featured, bestseller, new_arrival, on_sale,
  flower_type, flower_color, stem_count, bouquet_size, occasion, fragrance, freshness_information
) values
  ('Crimson Rose Bouquet', 'crimson-rose-bouquet',
   'A hand-tied bouquet of 24 premium long-stem roses, wrapped in signature ivory paper.',
   '24 premium long-stem roses', 'FLR-ROS-024', 'bouquet',
   349.00, 399.00, 180.00, 25, 5,
   'active', true, true, false, true,
   'Rose', 'Red', 24, 'large', 'Anniversary', 'Light, sweet', 'Freshly cut, lasts 7-10 days with proper care'),
  ('Blush Peony Arrangement', 'blush-peony-arrangement',
   'Soft blush peonies arranged in a glass vase — an elegant centerpiece for any occasion.',
   'Blush peonies in a glass vase', 'FLR-PEO-012', 'arrangement',
   289.00, null, 150.00, 15, 3,
   'active', true, false, true, false,
   'Peony', 'Blush Pink', 12, 'medium', 'Birthday', 'Delicate, sweet', 'Freshly cut, lasts 5-7 days with proper care'),
  ('Sunshine Tulip Bunch', 'sunshine-tulip-bunch',
   'A cheerful bunch of 15 yellow tulips, perfect for brightening someone''s day.',
   '15 yellow tulips', 'FLR-TUL-015', 'flower',
   129.00, null, 60.00, 40, 8,
   'active', false, false, true, false,
   'Tulip', 'Yellow', 15, 'small', 'Get Well Soon', 'Fresh, subtle', 'Freshly cut, lasts 5-7 days with proper care')
on conflict (slug) do nothing;

-- Products: plants ---------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, sku, product_type,
  base_price, compare_at_price, cost_price, stock_quantity, low_stock_threshold,
  status, featured, bestseller, new_arrival, on_sale,
  plant_type, indoor_outdoor, height_cm, pot_size, sunlight, watering_frequency, care_level, pot_included, care_instructions
) values
  ('Monstera Deliciosa', 'monstera-deliciosa',
   'A statement indoor plant with iconic split leaves, potted in a ceramic planter.',
   'Iconic split-leaf indoor plant', 'PLT-MON-001', 'plant',
   249.00, 289.00, 120.00, 18, 4,
   'active', true, true, false, true,
   'Monstera', 'indoor', 80.00, 'Medium', 'partial_sun', 'Weekly', 'easy', true,
   'Water when the top 5cm of soil is dry. Wipe leaves occasionally to keep them dust-free.'),
  ('Golden Pothos', 'golden-pothos',
   'A trailing, low-maintenance houseplant that thrives almost anywhere indoors.',
   'Low-maintenance trailing houseplant', 'PLT-POT-002', 'plant',
   89.00, null, 40.00, 50, 10,
   'active', false, true, false, false,
   'Pothos', 'indoor', 30.00, 'Small', 'shade', 'Bi-weekly', 'easy', true,
   'Tolerates low light. Water when soil feels dry to the touch.'),
  ('Olive Tree', 'olive-tree',
   'A Mediterranean olive tree in a terracotta pot, equally at home indoors or on a balcony.',
   'Mediterranean olive tree, indoor or outdoor', 'PLT-OLV-003', 'plant',
   399.00, null, 220.00, 8, 2,
   'active', false, false, true, false,
   'Olive', 'both', 120.00, 'Large', 'full_sun', 'Weekly', 'moderate', true,
   'Needs full sun and well-drained soil. Water deeply, then let soil dry before watering again.')
on conflict (slug) do nothing;

-- Products: gifts ------------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, sku, product_type,
  base_price, cost_price, stock_quantity, low_stock_threshold, status
) values
  ('Belgian Chocolate Box', 'belgian-chocolate-box',
   'A curated box of 12 Belgian chocolates, the perfect add-on to any bouquet.',
   '12-piece Belgian chocolate box', 'GFT-CHC-012', 'gift', 65.00, 30.00, 60, 15, 'active')
on conflict (slug) do nothing;

-- Product <-> category links -----------------------------------------------
insert into public.product_categories (product_id, category_id, is_primary)
select p.id, c.id, v.is_primary
from (values
  ('crimson-rose-bouquet', 'flowers', true),
  ('crimson-rose-bouquet', 'roses', false),
  ('blush-peony-arrangement', 'flowers', true),
  ('sunshine-tulip-bunch', 'flowers', true),
  ('monstera-deliciosa', 'plants', true),
  ('golden-pothos', 'plants', true),
  ('golden-pothos', 'succulents', false),
  ('olive-tree', 'plants', true),
  ('belgian-chocolate-box', 'gifts', true)
) as v(product_slug, category_slug, is_primary)
join public.products p on p.slug = v.product_slug
join public.categories c on c.slug = v.category_slug
on conflict (product_id, category_id) do nothing;

-- Collection <-> product links -----------------------------------------------
insert into public.collection_products (collection_id, product_id, display_order)
select col.id, p.id, v.display_order
from (values
  ('best-sellers', 'crimson-rose-bouquet', 1),
  ('best-sellers', 'monstera-deliciosa', 2),
  ('best-sellers', 'golden-pothos', 3),
  ('new-arrivals', 'blush-peony-arrangement', 1),
  ('new-arrivals', 'sunshine-tulip-bunch', 2),
  ('new-arrivals', 'olive-tree', 3)
) as v(collection_slug, product_slug, display_order)
join public.collections col on col.slug = v.collection_slug
join public.products p on p.slug = v.product_slug
on conflict (collection_id, product_id) do nothing;

-- Primary product image (placeholder paths — replace via the media library) -
insert into public.product_images (product_id, url, alt_text, is_primary, display_order)
select p.id, v.url, v.alt_text, true, 1
from (values
  ('crimson-rose-bouquet', '/images/seed/crimson-rose-bouquet.jpg', 'Crimson Rose Bouquet'),
  ('blush-peony-arrangement', '/images/seed/blush-peony-arrangement.jpg', 'Blush Peony Arrangement'),
  ('sunshine-tulip-bunch', '/images/seed/sunshine-tulip-bunch.jpg', 'Sunshine Tulip Bunch'),
  ('monstera-deliciosa', '/images/seed/monstera-deliciosa.jpg', 'Monstera Deliciosa'),
  ('golden-pothos', '/images/seed/golden-pothos.jpg', 'Golden Pothos'),
  ('olive-tree', '/images/seed/olive-tree.jpg', 'Olive Tree'),
  ('belgian-chocolate-box', '/images/seed/belgian-chocolate-box.jpg', 'Belgian Chocolate Box')
) as v(product_slug, url, alt_text)
join public.products p on p.slug = v.product_slug
on conflict (product_id) where is_primary and variant_id is null do nothing;

-- A couple of products with size/pot variants, to exercise the feature ------
insert into public.product_variants (product_id, sku, name, price_override, attributes, stock_quantity, is_default, display_order)
select p.id, v.sku, v.name, v.price_override, v.attributes::jsonb, v.stock_quantity, v.is_default, v.display_order
from (values
  ('crimson-rose-bouquet', 'FLR-ROS-012', '12 Roses', 219.00, '{"stem_count":"12"}', 20, false, 1),
  ('crimson-rose-bouquet', 'FLR-ROS-024', '24 Roses', 349.00, '{"stem_count":"24"}', 25, true, 2),
  ('crimson-rose-bouquet', 'FLR-ROS-050', '50 Roses', 649.00, '{"stem_count":"50"}', 10, false, 3),
  ('monstera-deliciosa', 'PLT-MON-SM', 'Small Pot', 179.00, '{"pot_size":"Small"}', 12, false, 1),
  ('monstera-deliciosa', 'PLT-MON-MD', 'Medium Pot', 249.00, '{"pot_size":"Medium"}', 18, true, 2)
) as v(product_slug, sku, name, price_override, attributes, stock_quantity, is_default, display_order)
join public.products p on p.slug = v.product_slug
on conflict (sku) do nothing;

-- Inventory: product-level rows for non-varianted products ------------------
insert into public.inventory (product_id, variant_id, quantity_on_hand, low_stock_threshold)
select p.id, null, p.stock_quantity, p.low_stock_threshold
from public.products p
where p.slug in (
  'blush-peony-arrangement', 'sunshine-tulip-bunch', 'golden-pothos', 'olive-tree', 'belgian-chocolate-box'
)
on conflict (product_id) where variant_id is null do nothing;

-- Inventory: per-variant rows for the varianted products ---------------------
insert into public.inventory (product_id, variant_id, quantity_on_hand, low_stock_threshold)
select pv.product_id, pv.id, pv.stock_quantity, 5
from public.product_variants pv
join public.products p on p.id = pv.product_id
where p.slug in ('crimson-rose-bouquet', 'monstera-deliciosa')
on conflict (product_id, variant_id) where variant_id is not null do nothing;

-- Delivery zones, areas, and slots -------------------------------------------
insert into public.delivery_zones (name, description, base_delivery_fee, minimum_order_amount, same_day_available) values
  ('Dubai Central', 'Downtown Dubai, Business Bay, DIFC, and surrounding areas', 25.00, 100.00, true),
  ('Dubai Marina & JBR', 'Dubai Marina, JBR, JLT, and Palm Jumeirah', 30.00, 100.00, true),
  ('Outer Dubai', 'Areas further from central Dubai — longer delivery windows', 45.00, 150.00, false)
on conflict (name) do nothing;

insert into public.delivery_zone_areas (delivery_zone_id, area_name)
select z.id, v.area_name
from (values
  ('Dubai Central', 'Downtown Dubai'),
  ('Dubai Central', 'Business Bay'),
  ('Dubai Central', 'DIFC'),
  ('Dubai Marina & JBR', 'Dubai Marina'),
  ('Dubai Marina & JBR', 'JBR'),
  ('Dubai Marina & JBR', 'Palm Jumeirah'),
  ('Outer Dubai', 'Dubai Silicon Oasis'),
  ('Outer Dubai', 'Dubai South')
) as v(zone_name, area_name)
join public.delivery_zones z on z.name = v.zone_name
on conflict (delivery_zone_id, area_name) do nothing;

insert into public.delivery_slots (label, start_time, end_time, is_same_day, extra_fee, display_order)
select v.label, v.start_time::time, v.end_time::time, v.is_same_day, v.extra_fee, v.display_order
from (values
  ('9:00 AM - 12:00 PM', '09:00', '12:00', true, 0::numeric, 1),
  ('12:00 PM - 3:00 PM', '12:00', '15:00', true, 0::numeric, 2),
  ('3:00 PM - 6:00 PM', '15:00', '18:00', true, 15.00::numeric, 3),
  ('6:00 PM - 9:00 PM', '18:00', '21:00', false, 15.00::numeric, 4)
) as v(label, start_time, end_time, is_same_day, extra_fee, display_order)
where not exists (select 1 from public.delivery_slots where label = v.label);

-- Homepage sections -----------------------------------------------------------
-- Guarded per-row by heading (homepage_sections has no natural unique key
-- otherwise) so re-running this file against an already-seeded database
-- adds newly-introduced section types without duplicating earlier ones —
-- e.g. the four original rows from Phase 2, still guarded here.
insert into public.homepage_sections (
  section_type, heading, subheading, cta_text, cta_url, layout, content, display_order, is_enabled
)
select v.section_type, v.heading, v.subheading, v.cta_text, v.cta_url, v.layout, v.content::jsonb, v.display_order, true
from (values
  ('hero', 'Flowers & Plants, Delivered Fresh Across Dubai', 'Same-day delivery available',
   'Shop Now', '/shop', 'full-bleed', '{}', 1),
  ('collection_showcase', 'Best Sellers', 'Loved by our customers',
   'View Collection', '/collections/best-sellers', 'carousel', '{"collection_slug":"best-sellers"}', 2),
  ('category_grid', 'Shop by Category', null, null, null,
   'grid-3', '{"category_slugs":["flowers","plants","gifts"]}', 3),
  ('collection_showcase', 'New Arrivals', 'Fresh in this week',
   'View Collection', '/collections/new-arrivals', 'carousel', '{"collection_slug":"new-arrivals"}', 4),
  ('featured_products', 'Editor''s Picks', 'Handpicked for you',
   null, null, 'carousel', '{"limit":8}', 5),
  ('occasion', 'Shop by Occasion', 'Flowers and gifts for every moment',
   null, null, null, '{}', 6),
  ('bestsellers', 'Customer Favorites', 'Our most-loved arrangements',
   'Shop Best Sellers', '/shop?sort=bestselling', 'carousel', '{"limit":8}', 7),
  ('promo_banner', 'Free delivery on orders over AED 300', 'Same-day delivery available across Dubai',
   'Shop Now', '/shop', null, '{}', 8),
  ('plant_section', 'Plants for Every Space', 'Low-maintenance greenery, delivered potted and ready',
   'Shop Plants', '/plants', 'carousel', '{"limit":8}', 9),
  ('trending_products', 'Trending Now', 'What Dubai is sending this week',
   null, null, 'carousel', '{"limit":8}', 10),
  ('gift_addons', 'Perfect Add-ons', 'Chocolates, vases, and cards to complete the gift',
   null, null, null, '{}', 11),
  ('testimonials', 'Loved by Dubai', 'What our customers are saying',
   null, null, null,
   '{"testimonials":[' ||
   '{"author":"Amina R.","body":"The roses arrived fresh and beautifully wrapped — exactly on time for the anniversary.","rating":5},' ||
   '{"author":"James T.","body":"Ordered a plant for my new office and it arrived in perfect condition. Will order again.","rating":5},' ||
   '{"author":"Fatima A.","body":"Same-day delivery saved my day. Gorgeous arrangement, great communication throughout.","rating":4}' ||
   ']}', 12),
  ('faq', 'Frequently Asked Questions', 'Everything you need to know about ordering and delivery',
   null, null, null, '{}', 13),
  ('newsletter', 'Stay in Bloom', 'Get seasonal arrangements and offers in your inbox',
   null, null, null, '{}', 14)
) as v(section_type, heading, subheading, cta_text, cta_url, layout, content, display_order)
where not exists (select 1 from public.homepage_sections where heading = v.heading);

-- FAQs (feed the homepage FAQ section and a future /faq page) ----------------
insert into public.faq_categories (name, slug, display_order)
values ('Ordering & Delivery', 'ordering-delivery', 1)
on conflict (slug) do nothing;

insert into public.faqs (faq_category_id, question, answer, display_order)
select c.id, v.question, v.answer, v.display_order
from (values
  ('Do you offer same-day delivery in Dubai?',
   'Yes — order before the daily cutoff time shown at checkout and we''ll deliver the same day across most of Dubai.', 1),
  ('How do I know my flowers will stay fresh?',
   'Every bouquet is cut and arranged the same day it ships, and each listing includes care instructions to help it last.', 2),
  ('Can I include a gift message?',
   'Yes — every order has an optional gift message field at checkout, delivered with the arrangement.', 3),
  ('What if I need to change my delivery address?',
   'Contact our support team as soon as possible with your order number and we''ll update it before dispatch where we can.', 4)
) as v(question, answer, display_order)
join public.faq_categories c on c.slug = 'ordering-delivery'
where not exists (select 1 from public.faqs where question = v.question);

-- Settings singletons -----------------------------------------------------------
insert into public.site_settings (site_name, site_description, contact_email, contact_phone)
select 'Dubai Flower Shop', 'Premium flower and plant delivery across Dubai, UAE.',
       'hello@dubaiflowershop.ae', '+971 4 000 0000'
where not exists (select 1 from public.site_settings);

insert into public.store_settings (whatsapp_number, support_email, support_phone)
select '+971 50 000 0000', 'support@dubaiflowershop.ae', '+971 4 000 0000'
where not exists (select 1 from public.store_settings);

insert into public.delivery_settings (free_delivery_threshold, same_day_cutoff_time, default_delivery_fee)
select 300.00, '15:00', 25.00
where not exists (select 1 from public.delivery_settings);

insert into public.payment_settings (cod_enabled, card_enabled, enabled_providers, test_mode)
select true, true, array['card', 'cod'], true
where not exists (select 1 from public.payment_settings);

insert into public.social_links (platform, url, display_order) values
  ('instagram', 'https://instagram.com/dubaiflowershop', 1),
  ('whatsapp', 'https://wa.me/971500000000', 2),
  ('facebook', 'https://facebook.com/dubaiflowershop', 3)
on conflict (platform) do nothing;

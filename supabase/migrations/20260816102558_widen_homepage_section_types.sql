-- Phase 5 needs distinct homepage section components (BestSellerSection,
-- OccasionSection, PromoBanner, TrendingProducts, PlantSection,
-- GiftAddons, FAQSection) that the original Phase 2 section_type list
-- didn't anticipate. Widening the CHECK constraint rather than replacing
-- it — existing values (hero, featured_products, category_grid,
-- collection_showcase, banner_grid, testimonials, newsletter,
-- custom_html, rich_text) all stay valid.
alter table public.homepage_sections
  drop constraint homepage_sections_section_type_check;

alter table public.homepage_sections
  add constraint homepage_sections_section_type_check
  check (section_type in (
    'hero','featured_products','category_grid','collection_showcase',
    'banner_grid','testimonials','newsletter','custom_html','rich_text',
    'bestsellers','occasion','promo_banner','trending_products',
    'plant_section','gift_addons','faq'
  ));

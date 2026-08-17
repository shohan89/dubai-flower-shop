import { HeroSection } from "@/components/storefront/sections/hero-section";
import { CategoryGridSection } from "@/components/storefront/sections/category-grid-section";
import { ProductCarouselSection } from "@/components/storefront/sections/product-carousel-section";
import { OccasionSection } from "@/components/storefront/sections/occasion-section";
import { PromoBannerSection } from "@/components/storefront/sections/promo-banner-section";
import { GiftAddonsSection } from "@/components/storefront/sections/gift-addons-section";
import { TestimonialsSection } from "@/components/storefront/sections/testimonials-section";
import { FaqSection } from "@/components/storefront/sections/faq-section";
import { NewsletterSection } from "@/components/storefront/sections/newsletter-section";
import type { ResolvedSection } from "@/services/homepage.service";

export function SectionRenderer({ section }: { section: ResolvedSection }) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;
    case "category_grid":
      return <CategoryGridSection section={section} />;
    case "featured_products":
    case "bestsellers":
    case "trending_products":
    case "plant_section":
    case "collection_showcase":
      return <ProductCarouselSection section={section} />;
    case "occasion":
      return <OccasionSection section={section} />;
    case "promo_banner":
      return <PromoBannerSection section={section} />;
    case "gift_addons":
      return <GiftAddonsSection section={section} />;
    case "testimonials":
      return <TestimonialsSection section={section} />;
    case "faq":
      return <FaqSection section={section} />;
    case "newsletter":
      return <NewsletterSection section={section} />;
    default:
      // banner_grid, custom_html, rich_text: not built in this phase —
      // render nothing rather than crash on an admin-created section of
      // a type this phase doesn't have a component for yet.
      return null;
  }
}

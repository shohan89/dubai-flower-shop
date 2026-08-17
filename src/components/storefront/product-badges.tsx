import { discountPercent } from "@/lib/storefront/pricing";
import type { ProductCardData } from "@/services/storefront-product.service";

export function ProductBadges({ product }: { product: ProductCardData }) {
  const discount = discountPercent(product.base_price, product.compare_at_price);
  const badges: { label: string; className: string }[] = [];

  if (product.new_arrival) badges.push({ label: "New", className: "bg-brand-accent/90 text-white" });
  if (product.bestseller) badges.push({ label: "Bestseller", className: "bg-primary text-primary-foreground" });
  if (product.featured) badges.push({ label: "Featured", className: "bg-brand-gold text-primary" });
  if (discount) badges.push({ label: `-${discount}%`, className: "bg-destructive text-destructive-foreground" });

  if (badges.length === 0) return null;

  return (
    <div className="absolute left-2 top-2 flex flex-col gap-1">
      {badges.slice(0, 2).map((badge) => (
        <span
          key={badge.label}
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${badge.className}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

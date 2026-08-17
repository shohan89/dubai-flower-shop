import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/repositories/settings.repository";
import { listSocialLinks } from "@/repositories/settings.repository";
import { getCurrentCartView } from "@/services/cart.service";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { CartDrawerProvider } from "@/components/storefront/cart-drawer-context";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [siteSettings, socialLinks, cart] = await Promise.all([
    getSiteSettings(supabase),
    listSocialLinks(supabase),
    getCurrentCartView(),
  ]);

  return (
    <CartDrawerProvider>
      <StorefrontHeader cartItemCount={cart.itemCount} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter
        siteName={siteSettings?.site_name ?? "Dubai Flower Shop"}
        siteDescription={siteSettings?.site_description ?? null}
        contactEmail={siteSettings?.contact_email ?? null}
        contactPhone={siteSettings?.contact_phone ?? null}
        socialLinks={socialLinks}
      />
      <CartDrawer items={cart.items} subtotal={cart.subtotal} />
    </CartDrawerProvider>
  );
}

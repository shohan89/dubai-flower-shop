import Link from "next/link";
import { Link2 } from "lucide-react";
import { STOREFRONT_NAV_ITEMS } from "@/components/storefront/storefront-nav-items";
import type { Database } from "@/types/database.types";

// lucide-react deliberately ships no brand/logo icons (Instagram, GitHub,
// etc. were removed from the library) — a generic link glyph plus the
// platform name (visually hidden, read by screen readers via aria-label)
// stands in rather than pulling in a second icon set for a handful of links.

export function StorefrontFooter({
  siteName,
  siteDescription,
  contactEmail,
  contactPhone,
  socialLinks,
}: {
  siteName: string;
  siteDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: Database["public"]["Tables"]["social_links"]["Row"][];
}) {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3 lg:col-span-2">
          <p className="font-heading text-xl text-primary">{siteName}</p>
          {siteDescription ? (
            <p className="max-w-sm text-sm text-muted-foreground">{siteDescription}</p>
          ) : null}
          {socialLinks.length > 0 ? (
            <div className="flex gap-3 pt-2">
              {socialLinks.map((link) => {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                  >
                    <Link2 className="size-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Shop</p>
          <ul className="space-y-2">
            {STOREFRONT_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Contact</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {contactEmail ? (
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-foreground">
                  {contactEmail}
                </a>
              </li>
            ) : null}
            {contactPhone ? (
              <li>
                <a href={`tel:${contactPhone}`} className="hover:text-foreground">
                  {contactPhone}
                </a>
              </li>
            ) : null}
            <li>Dubai, United Arab Emirates</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </div>
    </footer>
  );
}

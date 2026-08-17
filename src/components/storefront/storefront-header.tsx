import Link from "next/link";
import { Search, User } from "lucide-react";
import { STOREFRONT_NAV_ITEMS } from "@/components/storefront/storefront-nav-items";
import { MobileNav } from "@/components/storefront/mobile-nav";
import { CartTriggerButton } from "@/components/storefront/cart-trigger-button";

export function StorefrontHeader({ cartItemCount }: { cartItemCount: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="font-heading text-xl text-primary">
            Dubai Flower Shop
          </Link>
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {STOREFRONT_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden size-9 items-center justify-center rounded-full transition-colors hover:bg-muted sm:flex"
          >
            <User className="size-5" />
          </Link>
          <CartTriggerButton itemCount={cartItemCount} />
        </div>
      </div>
    </header>
  );
}

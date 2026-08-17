"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STOREFRONT_NAV_ITEMS } from "@/components/storefront/storefront-nav-items";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 bg-secondary p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-lg text-primary">Dubai Flower Shop</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {STOREFRONT_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-1 border-t border-border pt-4">
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Search className="size-4" />
            Search
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <User className="size-4" />
            My account
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

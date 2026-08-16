"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNavList } from "@/components/admin/admin-nav-list";
import type { AdminNavItem } from "@/constants/admin-nav";

export function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
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
      <SheetContent side="left" className="w-72 bg-primary p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-lg text-brand-secondary">
            Dubai Flower Shop
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <AdminNavList items={items} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

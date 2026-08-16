"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AdminNavItem } from "@/constants/admin-nav";

export function AdminNavList({
  items,
  onNavigate,
}: {
  items: AdminNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href as Route}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-white/10 text-brand-secondary"
                : "text-brand-secondary/70 hover:bg-white/5 hover:text-brand-secondary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

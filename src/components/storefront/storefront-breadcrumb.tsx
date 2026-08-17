import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export function StorefrontBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5" />
          {item.href ? (
            <Link href={item.href as Route} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

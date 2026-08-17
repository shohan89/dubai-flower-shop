import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPageHref, type ListingSearchParams } from "@/lib/storefront/listing-params";

export function StorefrontPagination({
  basePath,
  searchParams,
  page,
  pageSize,
  totalCount,
}: {
  basePath: string;
  searchParams: ListingSearchParams;
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <PageLink
        disabled={page <= 1}
        href={buildPageHref(basePath, searchParams, page - 1) as Route}
        label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </PageLink>
      <span className="px-3 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <PageLink
        disabled={page >= totalPages}
        href={buildPageHref(basePath, searchParams, page + 1) as Route}
        label="Next page"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </div>
  );
}

function PageLink({
  disabled,
  href,
  label,
  children,
}: {
  disabled: boolean;
  href: Route;
  label: string;
  children: React.ReactNode;
}) {
  const className = cn(
    "inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors",
    disabled ? "pointer-events-none opacity-40" : "hover:bg-muted",
  );
  if (disabled) {
    return (
      <span className={className} aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

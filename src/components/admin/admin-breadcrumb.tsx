"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ADMIN_NAV_ITEMS } from "@/constants/admin-nav";

function labelForSegment(href: string, segment: string): string {
  const match = ADMIN_NAV_ITEMS.find((item) => item.href === href);
  if (match) return match.label;
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const rawSegments = pathname.split("/").filter(Boolean).slice(1); // drop leading "admin"
  // "/admin/dashboard" is the root — don't also show it as a segment crumb.
  const segments = rawSegments[0] === "dashboard" ? rawSegments.slice(1) : rawSegments;

  const crumbs = segments.map((segment, index) => {
    const href = "/admin/" + segments.slice(0, index + 1).join("/");
    // Only known nav destinations are real pages — anything else (e.g. an
    // intermediate "/admin/delivery" segment, or a dynamic [id]) is shown
    // as plain text rather than a dead link.
    const isRealPage = ADMIN_NAV_ITEMS.some((item) => item.href === href);
    return { href, label: labelForSegment(href, segment), isRealPage };
  });

  const isDashboardRoot = crumbs.length === 0;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isDashboardRoot ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={crumb.href} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !crumb.isRealPage ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

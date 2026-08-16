import Link from "next/link";
import type { Role } from "@/constants/roles";
import { getVisibleAdminNavItems } from "@/constants/admin-nav";
import { AdminNavList } from "@/components/admin/admin-nav-list";

export function AdminSidebar({ roles }: { roles: Role[] }) {
  const items = getVisibleAdminNavItems(roles);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-primary px-4 py-6 lg:flex">
      <Link href="/admin/dashboard" className="mb-8 px-3 font-heading text-lg text-brand-secondary">
        Dubai Flower Shop
      </Link>
      <AdminNavList items={items} />
    </aside>
  );
}

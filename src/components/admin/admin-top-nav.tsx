import { getVisibleAdminNavItems } from "@/constants/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import type { Role } from "@/constants/roles";

export function AdminTopNav({ email, roles }: { email: string; roles: Role[] }) {
  const items = getVisibleAdminNavItems(roles);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileNav items={items} />
        <AdminBreadcrumb />
      </div>
      <AdminUserMenu email={email} roles={roles} />
    </header>
  );
}

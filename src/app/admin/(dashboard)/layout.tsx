import { requireAdminAccess } from "@/services/authorization.service";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopNav } from "@/components/admin/admin-top-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check: confirms a session AND at least one staff role.
  // Section-level pages additionally call requireAdminAccess(resource).
  const { user, roles } = await requireAdminAccess();

  return (
    <div className="flex min-h-screen bg-secondary">
      <AdminSidebar roles={roles} />
      <div className="flex flex-1 flex-col">
        <AdminTopNav email={user.email ?? ""} roles={roles} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

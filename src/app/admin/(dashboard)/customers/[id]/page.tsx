import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminAccess } from "@/services/authorization.service";
import { getCustomerDetail } from "@/services/customer.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { orderStatusTone } from "@/lib/admin/status-tones";

export const metadata: Metadata = {
  title: "Customer detail",
  robots: { index: false, follow: false },
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess("customers");
  const { id } = await params;

  const data = await getCustomerDetail(id);
  if (!data) notFound();

  const { customer, addresses, orders, totalSpent, orderCount } = data;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">{customer.full_name ?? customer.email}</h1>
        <p className="text-sm text-muted-foreground">{customer.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Orders" value={String(orderCount)} />
        <StatCard label="Total spent" value={`AED ${totalSpent.toFixed(2)}`} />
        <StatCard label="Phone" value={customer.phone ?? "—"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved addresses.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="text-sm">
                <p className="font-medium">
                  {address.recipient_name} {address.is_default ? "· Default" : ""}
                </p>
                <p className="text-muted-foreground">
                  {[address.building, address.apartment, address.street, address.area, address.emirate]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:underline">
                  {order.order_number}
                </Link>
                <span>AED {order.total}</span>
                <StatusBadge label={order.status} tone={orderStatusTone(order.status)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

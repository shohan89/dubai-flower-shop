import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminAccess } from "@/services/authorization.service";
import { getDashboardData } from "@/services/dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { orderStatusTone } from "@/lib/admin/status-tones";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { SalesChart } from "@/components/admin/dashboard/sales-chart";
import { OrderStatusDistribution } from "@/components/admin/dashboard/order-status-distribution";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  await requireAdminAccess();

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Store performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total sales" value={`AED ${data.totalSales.toFixed(2)}`} />
        <StatCard label="Today's sales" value={`AED ${data.todaySales.toFixed(2)}`} />
        <StatCard label="Orders today" value={String(data.ordersToday)} />
        <StatCard label="Pending orders" value={String(data.pendingOrders)} />
        <StatCard label="Delivered orders" value={String(data.deliveredOrders)} />
        <StatCard label="Customers" value={String(data.customerCount)} />
        <StatCard label="Products" value={String(data.productCount)} />
        <StatCard label="Low stock" value={String(data.lowStockCount)} emphasis={data.lowStockCount > 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales, last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={data.salesChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusDistribution data={data.statusDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:underline">
                    {order.order_number}
                  </Link>
                  <span className="text-muted-foreground">{order.customer_name}</span>
                  <span>AED {order.total}</span>
                  <StatusBadge label={order.status} tone={orderStatusTone(order.status)} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top products (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales in this window yet.</p>
            ) : (
              data.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">{product.quantity} sold</span>
                  <span>AED {product.revenue.toFixed(2)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

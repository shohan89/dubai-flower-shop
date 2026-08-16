import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  getSalesTotals,
  getOrderStatusCounts,
  getRecentOrders,
  getTopProducts,
  countProducts,
} from "@/repositories/dashboard.repository";
import { countCustomers } from "@/repositories/customers.repository";
import { countLowStockInventory } from "@/repositories/inventory.repository";
import { ORDER_STATUSES } from "@/constants/order-status";

const SALES_CHART_DAYS = 14;
const TOP_PRODUCTS_WINDOW_DAYS = 30;

function isSameDay(iso: string, reference: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardData() {
  const supabase = await createClient();
  const now = new Date();
  const topProductsSince = new Date(now.getTime() - TOP_PRODUCTS_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [salesRows, statusRows, recentOrders, topProductRows, productCount, customerCount, lowStockCount] =
    await Promise.all([
      getSalesTotals(supabase),
      getOrderStatusCounts(supabase),
      getRecentOrders(supabase, 8),
      getTopProducts(supabase, topProductsSince.toISOString()),
      countProducts(supabase),
      countCustomers(supabase),
      countLowStockInventory(supabase),
    ]);

  const totalSales = salesRows.reduce((sum, row) => sum + Number(row.total), 0);
  const todaySales = salesRows
    .filter((row) => isSameDay(row.placed_at, now))
    .reduce((sum, row) => sum + Number(row.total), 0);

  const ordersToday = statusRows.filter((row) => isSameDay(row.placed_at, now)).length;
  const pendingOrders = statusRows.filter((row) => row.status === "pending").length;
  const deliveredOrders = statusRows.filter((row) => row.status === "delivered").length;

  const statusDistribution = ORDER_STATUSES.map((status) => ({
    status,
    count: statusRows.filter((row) => row.status === status).length,
  }));

  // Daily sales for the last SALES_CHART_DAYS days, oldest first.
  const salesByDay = new Map<string, number>();
  for (let i = SALES_CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    salesByDay.set(dayKey(d), 0);
  }
  for (const row of salesRows) {
    const key = dayKey(new Date(row.placed_at));
    if (salesByDay.has(key)) {
      salesByDay.set(key, (salesByDay.get(key) ?? 0) + Number(row.total));
    }
  }
  const salesChart = Array.from(salesByDay.entries()).map(([date, total]) => ({ date, total }));

  const topProductsMap = new Map<string, { quantity: number; revenue: number }>();
  for (const item of topProductRows) {
    const existing = topProductsMap.get(item.product_name_snapshot) ?? { quantity: 0, revenue: 0 };
    existing.quantity += item.quantity;
    existing.revenue += Number(item.line_subtotal);
    topProductsMap.set(item.product_name_snapshot, existing);
  }
  const topProducts = Array.from(topProductsMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalSales,
    todaySales,
    ordersToday,
    pendingOrders,
    deliveredOrders,
    customerCount,
    productCount,
    lowStockCount,
    recentOrders,
    topProducts,
    salesChart,
    statusDistribution,
  };
}

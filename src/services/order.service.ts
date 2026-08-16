import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listOrders,
  getOrderById,
  getOrderItems,
  getOrderDelivery,
  getOrderPayments,
  getOrderRefunds,
  getOrderStatusHistory,
  updateOrder,
  updateOrderNotes,
  type OrderListFilters,
} from "@/repositories/orders.repository";
import { canTransitionOrderStatus, type OrderStatus } from "@/constants/order-status";

export async function listOrdersForAdmin(filters: OrderListFilters) {
  const supabase = await createClient();
  return listOrders(supabase, filters);
}

export async function getOrderDetail(id: string) {
  const supabase = await createClient();
  const order = await getOrderById(supabase, id);
  if (!order) return null;

  const [items, delivery, payments, refunds, statusHistory] = await Promise.all([
    getOrderItems(supabase, id),
    getOrderDelivery(supabase, id),
    getOrderPayments(supabase, id),
    getOrderRefunds(supabase, id),
    getOrderStatusHistory(supabase, id),
  ]);

  return { order, items, delivery, payments, refunds, statusHistory };
}

export async function transitionOrderStatus(
  id: string,
  newStatus: OrderStatus,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const order = await getOrderById(supabase, id);
  if (!order) return { error: "Order not found." };

  if (!canTransitionOrderStatus(order.status, newStatus)) {
    return { error: `Cannot move an order from "${order.status}" to "${newStatus}".` };
  }

  await updateOrder(supabase, id, { status: newStatus });
  return { success: true };
}

export async function updateOrderNotesById(id: string, notes: string): Promise<void> {
  const supabase = await createClient();
  await updateOrderNotes(supabase, id, notes);
}

/** Mirrors the CHECK constraint on orders.status in supabase/migrations/*_orders.sql. */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Allowed forward transitions per status. Not part of the database schema
 * (the CHECK constraint only validates the value, not the transition) —
 * enforced here at the service layer. `cancelled` is reachable from any
 * non-terminal status; `delivered` can only become `refunded`.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready_for_delivery", "cancelled"],
  ready_for_delivery: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransitionOrderStatus(from: string, to: string): boolean {
  const allowed = ORDER_STATUS_TRANSITIONS[from as OrderStatus];
  return Boolean(allowed?.includes(to as OrderStatus));
}

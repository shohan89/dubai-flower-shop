import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminAccess } from "@/services/authorization.service";
import { getOrderDetail } from "@/services/order.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { paymentStatusTone } from "@/lib/admin/status-tones";
import { OrderStatusControl } from "@/components/admin/orders/order-status-control";
import { OrderNotesForm } from "@/components/admin/orders/order-notes-form";
import type { OrderStatus } from "@/constants/order-status";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess("orders");
  const { id } = await params;

  const data = await getOrderDetail(id);
  if (!data) notFound();

  const { order, items, delivery, payments, refunds, statusHistory } = data;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.placed_at).toLocaleString("en-AE")}
          </p>
        </div>
        <StatusBadge label={order.payment_status} tone={paymentStatusTone(order.payment_status)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusControl orderId={order.id} status={order.status as OrderStatus} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p>{order.customer_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{order.customer_email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{order.customer_phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{item.product_name_snapshot}</p>
                <p className="text-xs text-muted-foreground">
                  {item.product_sku_snapshot}
                  {item.variant_name_snapshot ? ` · ${item.variant_name_snapshot}` : ""} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">AED {item.line_subtotal}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <PriceRow label="Subtotal" value={order.subtotal} />
          <PriceRow label="Discount" value={`-${order.discount_total}`} />
          <PriceRow label="Delivery fee" value={order.delivery_fee} />
          <PriceRow label="Tax" value={order.tax_total} />
          <PriceRow label="Total" value={order.total} bold />
          {order.coupon_code ? (
            <p className="pt-2 text-xs text-muted-foreground">Coupon: {order.coupon_code}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment records yet.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between text-sm">
                <span>
                  {payment.provider} — AED {payment.amount}
                </span>
                <StatusBadge label={payment.status} tone={paymentStatusTone(payment.status)} />
              </div>
            ))
          )}
          {refunds.length > 0 ? (
            <div className="border-t border-border pt-2">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Refunds</p>
              {refunds.map((refund) => (
                <div key={refund.id} className="flex items-center justify-between text-sm">
                  <span>AED {refund.amount}</span>
                  <StatusBadge label={refund.status} tone={paymentStatusTone(refund.status)} />
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery &amp; address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {delivery ? (
            <>
              <p>{delivery.recipient_name} — {delivery.recipient_phone}</p>
              <p className="text-muted-foreground">
                {[delivery.building, delivery.apartment, delivery.street, delivery.area, delivery.emirate]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {delivery.landmark ? <p className="text-muted-foreground">Landmark: {delivery.landmark}</p> : null}
              <p className="pt-1">
                Delivery date: {delivery.delivery_date} · Fee: AED {delivery.delivery_fee}
              </p>
              <StatusBadge label={delivery.status} tone={paymentStatusTone(delivery.status)} />
            </>
          ) : (
            <p className="text-muted-foreground">No delivery details recorded.</p>
          )}
          {order.gift_message ? (
            <p className="pt-2 text-muted-foreground">Gift message: “{order.gift_message}”</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status changes yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {statusHistory.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between">
                  <span>
                    {entry.previous_status ? `${entry.previous_status} → ` : ""}
                    {entry.new_status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString("en-AE")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderNotesForm orderId={order.id} notes={order.order_notes} />
        </CardContent>
      </Card>
    </div>
  );
}

function PriceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>AED {value}</span>
    </div>
  );
}

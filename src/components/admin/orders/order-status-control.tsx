"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { orderStatusTone } from "@/lib/admin/status-tones";
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "@/constants/order-status";
import { updateOrderStatusAction } from "@/app/admin/(dashboard)/orders/actions";

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextOptions = ORDER_STATUS_TRANSITIONS[current] ?? [];

  function handleTransition(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (result.error) {
        setError(result.error);
      } else {
        setCurrent(next);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current status</span>
        <StatusBadge label={current} tone={orderStatusTone(current)} />
      </div>
      {nextOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {nextOptions.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={option === "cancelled" ? "destructive" : "secondary"}
              disabled={isPending}
              onClick={() => handleTransition(option)}
            >
              Mark as {option.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This order is in a final state.</p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

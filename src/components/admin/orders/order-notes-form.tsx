"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  updateOrderNotesAction,
  type OrderActionState,
} from "@/app/admin/(dashboard)/orders/actions";

export function OrderNotesForm({ orderId, notes }: { orderId: string; notes: string | null }) {
  const boundAction = updateOrderNotesAction.bind(null, orderId);
  const [state, formAction] = useActionState<OrderActionState, FormData>(boundAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <Textarea name="notes" defaultValue={notes ?? ""} rows={4} placeholder="Internal notes about this order…" />
      {state.success ? <p className="text-sm text-primary">Saved.</p> : null}
      <SubmitButton size="sm" variant="secondary">
        Save notes
      </SubmitButton>
    </form>
  );
}

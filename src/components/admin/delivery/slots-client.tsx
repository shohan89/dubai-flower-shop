"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/shared/drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { activeInactiveTone } from "@/lib/admin/status-tones";
import { SlotForm } from "@/components/admin/delivery/slot-form";
import { createSlotAction, updateSlotAction, deleteSlotAction } from "@/app/admin/(dashboard)/delivery/slots/actions";
import type { Database } from "@/types/database.types";

type SlotRow = Database["public"]["Tables"]["delivery_slots"]["Row"];

export function SlotsClient({ slots }: { slots: SlotRow[] }) {
  const [editing, setEditing] = useState<SlotRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<SlotRow | null>(null);

  const columns: DataTableColumn<SlotRow>[] = [
    { key: "label", label: "Label", render: (row) => row.label },
    { key: "window", label: "Window", render: (row) => `${row.start_time.slice(0, 5)}–${row.end_time.slice(0, 5)}` },
    { key: "same_day", label: "Same-day", render: (row) => (row.is_same_day ? "Yes" : "No") },
    { key: "fee", label: "Extra fee", render: (row) => `AED ${row.extra_fee}` },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <StatusBadge label={row.is_active ? "active" : "inactive"} tone={activeInactiveTone(row.is_active)} />
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-20",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="icon-xs" variant="outline" aria-label="Edit" onClick={() => setEditing(row)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button size="icon-xs" variant="destructive" aria-label="Delete" onClick={() => setDeleting(row)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Delivery slots</h1>
          <p className="text-sm text-muted-foreground">{slots.length} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New slot
        </Button>
      </div>

      <DataTable columns={columns} rows={slots} getRowId={(row) => row.id} emptyMessage="No delivery slots yet." />

      <Drawer
        title={editing === "new" ? "New delivery slot" : "Edit delivery slot"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <SlotForm
            slot={editing === "new" ? undefined : editing}
            action={editing === "new" ? createSlotAction : updateSlotAction.bind(null, editing.id)}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete delivery slot?"
        description={`"${deleting?.label}" will no longer be offered at checkout.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteSlotAction(deleting.id);
        }}
      />
    </div>
  );
}

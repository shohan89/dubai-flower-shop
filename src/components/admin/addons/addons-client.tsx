"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/shared/drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { activeInactiveTone } from "@/lib/admin/status-tones";
import { AddonForm } from "@/components/admin/addons/addon-form";
import {
  createAddonAction,
  updateAddonAction,
  deleteAddonAction,
} from "@/app/admin/(dashboard)/addons/actions";
import type { Database } from "@/types/database.types";

type AddonRow = Database["public"]["Tables"]["addons"]["Row"];

export function AddonsClient({ addons }: { addons: AddonRow[] }) {
  const [editing, setEditing] = useState<AddonRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<AddonRow | null>(null);

  const columns: DataTableColumn<AddonRow>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "price", label: "Price", render: (row) => `AED ${row.price}` },
    { key: "stock", label: "Stock", render: (row) => row.stock_quantity ?? "Unlimited" },
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
          <h1 className="font-heading text-2xl text-foreground">Add-ons</h1>
          <p className="text-sm text-muted-foreground">{addons.length} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New add-on
        </Button>
      </div>

      <DataTable columns={columns} rows={addons} getRowId={(row) => row.id} emptyMessage="No add-ons yet." />

      <Drawer
        title={editing === "new" ? "New add-on" : "Edit add-on"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <AddonForm
            addon={editing === "new" ? undefined : editing}
            action={editing === "new" ? createAddonAction : updateAddonAction.bind(null, editing.id)}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete add-on?"
        description={`"${deleting?.name}" will no longer be offered on any product.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteAddonAction(deleting.id);
        }}
      />
    </div>
  );
}

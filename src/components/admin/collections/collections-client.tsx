"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/shared/drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { activeInactiveTone } from "@/lib/admin/status-tones";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import {
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
} from "@/app/admin/(dashboard)/collections/actions";
import type { Database } from "@/types/database.types";

type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

export function CollectionsClient({ collections }: { collections: CollectionRow[] }) {
  const [editing, setEditing] = useState<CollectionRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<CollectionRow | null>(null);

  const columns: DataTableColumn<CollectionRow>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "slug", label: "Slug", render: (row) => <span className="font-mono text-xs">{row.slug}</span> },
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
          <h1 className="font-heading text-2xl text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">{collections.length} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New collection
        </Button>
      </div>

      <DataTable columns={columns} rows={collections} getRowId={(row) => row.id} emptyMessage="No collections yet." />

      <Drawer
        title={editing === "new" ? "New collection" : "Edit collection"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <CollectionForm
            collection={editing === "new" ? undefined : editing}
            action={editing === "new" ? createCollectionAction : updateCollectionAction.bind(null, editing.id)}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete collection?"
        description={`"${deleting?.name}" will be removed from the storefront. Products stay, just unlinked.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteCollectionAction(deleting.id);
        }}
      />
    </div>
  );
}

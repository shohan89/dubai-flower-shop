"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/shared/drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { activeInactiveTone } from "@/lib/admin/status-tones";
import { CategoryForm } from "@/components/admin/categories/category-form";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/(dashboard)/categories/actions";
import type { Database } from "@/types/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export function CategoriesClient({ categories }: { categories: CategoryRow[] }) {
  const [editing, setEditing] = useState<CategoryRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);

  const columns: DataTableColumn<CategoryRow>[] = [
    { key: "name", label: "Name", render: (row) => row.name },
    { key: "slug", label: "Slug", render: (row) => <span className="font-mono text-xs">{row.slug}</span> },
    {
      key: "parent",
      label: "Parent",
      render: (row) => categories.find((c) => c.id === row.parent_id)?.name ?? "—",
    },
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
          <h1 className="font-heading text-2xl text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <DataTable columns={columns} rows={categories} getRowId={(row) => row.id} emptyMessage="No categories yet." />

      <Drawer
        title={editing === "new" ? "New category" : "Edit category"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <CategoryForm
            category={editing === "new" ? undefined : editing}
            allCategories={categories}
            action={editing === "new" ? createCategoryAction : updateCategoryAction.bind(null, editing.id)}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete category?"
        description={`"${deleting?.name}" will be removed from the storefront. Products stay, just unlinked.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteCategoryAction(deleting.id);
        }}
      />
    </div>
  );
}

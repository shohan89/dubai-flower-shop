"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/shared/drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { activeInactiveTone } from "@/lib/admin/status-tones";
import { CouponForm } from "@/components/admin/coupons/coupon-form";
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
} from "@/app/admin/(dashboard)/coupons/actions";
import type { TableSearchParams } from "@/lib/admin/table-params";
import type { Database } from "@/types/database.types";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export function CouponsClient({
  coupons,
  page,
  pageSize,
  totalCount,
  searchParams,
}: {
  coupons: CouponRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  searchParams: TableSearchParams;
}) {
  const [editing, setEditing] = useState<CouponRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<CouponRow | null>(null);

  const columns: DataTableColumn<CouponRow>[] = [
    { key: "code", label: "Code", render: (row) => <span className="font-mono text-xs font-medium">{row.code}</span> },
    {
      key: "discount",
      label: "Discount",
      render: (row) =>
        row.discount_type === "percentage" ? `${row.discount_value}%` : `AED ${row.discount_value}`,
    },
    { key: "usage", label: "Used", render: (row) => `${row.times_used}${row.usage_limit ? ` / ${row.usage_limit}` : ""}` },
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
          <h1 className="font-heading text-2xl text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground">{totalCount} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New coupon
        </Button>
      </div>

      <DataTable columns={columns} rows={coupons} getRowId={(row) => row.id} emptyMessage="No coupons yet." />
      <DataTablePagination basePath="/admin/coupons" searchParams={searchParams} page={page} pageSize={pageSize} totalCount={totalCount} />

      <Drawer
        title={editing === "new" ? "New coupon" : "Edit coupon"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <CouponForm
            coupon={editing === "new" ? undefined : editing}
            action={editing === "new" ? createCouponAction : updateCouponAction.bind(null, editing.id)}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete coupon?"
        description={`"${deleting?.code}" will stop working immediately.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteCouponAction(deleting.id);
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/shared/drawer";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { InventoryAdjustForm } from "@/components/admin/inventory/inventory-adjust-form";
import type { InventoryListItem } from "@/repositories/inventory.repository";

export function InventoryClient({ rows }: { rows: InventoryListItem[] }) {
  const [adjusting, setAdjusting] = useState<InventoryListItem | null>(null);

  const columns: DataTableColumn<InventoryListItem>[] = [
    { key: "product", label: "Product", render: (row) => row.productName },
    { key: "variant", label: "Variant", render: (row) => row.variantName ?? "—" },
    { key: "sku", label: "SKU", render: (row) => <span className="font-mono text-xs">{row.productSku}</span> },
    { key: "on_hand", label: "On hand", render: (row) => row.quantity_on_hand },
    { key: "reserved", label: "Reserved", render: (row) => row.quantity_reserved },
    {
      key: "available",
      label: "Available",
      render: (row) => (
        <span className={row.quantity_available <= row.low_stock_threshold ? "font-medium text-destructive" : ""}>
          {row.quantity_available}
        </span>
      ),
    },
    { key: "threshold", label: "Low stock at", render: (row) => row.low_stock_threshold },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (row) => (
        <Button size="icon-xs" variant="outline" aria-label="Adjust stock" onClick={() => setAdjusting(row)}>
          <Pencil className="size-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} emptyMessage="No inventory records." />
      <Drawer
        title="Adjust stock"
        description={adjusting ? `${adjusting.productName}${adjusting.variantName ? ` — ${adjusting.variantName}` : ""}` : undefined}
        open={adjusting !== null}
        onOpenChange={(open) => !open && setAdjusting(null)}
      >
        {adjusting ? (
          <InventoryAdjustForm
            inventoryId={adjusting.id}
            currentAvailable={adjusting.quantity_available}
            onSuccess={() => setAdjusting(null)}
          />
        ) : null}
      </Drawer>
    </>
  );
}

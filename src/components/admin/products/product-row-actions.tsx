"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  duplicateProductAction,
  archiveProductAction,
  deleteProductAction,
  setProductStatusAction,
  toggleProductFlagAction,
} from "@/app/admin/(dashboard)/products/actions";

export function ProductRowActions({
  id,
  status,
  featured,
  bestseller,
  newArrival,
  onSale,
}: {
  id: string;
  status: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  onSale: boolean;
}) {
  const [, startTransition] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Product actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Link href={`/admin/products/${id}`}>
                <Pencil />
                Edit
              </Link>
            }
          />
          <DropdownMenuItem onClick={() => startTransition(() => duplicateProductAction(id))}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status === "active" ? (
            <DropdownMenuItem
              onClick={() => startTransition(() => setProductStatusAction(id, "draft"))}
            >
              Unpublish
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => startTransition(() => setProductStatusAction(id, "active"))}
            >
              Publish
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => startTransition(() => archiveProductAction(id))}>
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => startTransition(() => toggleProductFlagAction(id, "featured", !featured))}
          >
            {featured ? "Remove featured" : "Mark as featured"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => startTransition(() => toggleProductFlagAction(id, "bestseller", !bestseller))}
          >
            {bestseller ? "Remove bestseller" : "Mark as bestseller"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => startTransition(() => toggleProductFlagAction(id, "new_arrival", !newArrival))}
          >
            {newArrival ? "Remove new arrival" : "Mark as new arrival"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => startTransition(() => toggleProductFlagAction(id, "on_sale", !onSale))}
          >
            {onSale ? "Remove sale" : "Mark on sale"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete product?"
        description="This soft-deletes the product — it will no longer appear anywhere on the storefront or in this list."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteProductAction(id)}
      />
    </>
  );
}

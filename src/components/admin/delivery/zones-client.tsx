"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/shared/drawer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { activeInactiveTone } from "@/lib/admin/status-tones";
import { ZoneForm } from "@/components/admin/delivery/zone-form";
import {
  createZoneAction,
  updateZoneAction,
  deleteZoneAction,
  addZoneAreaAction,
  removeZoneAreaAction,
} from "@/app/admin/(dashboard)/delivery/zones/actions";
import type { Database } from "@/types/database.types";

type ZoneRow = Database["public"]["Tables"]["delivery_zones"]["Row"];
type AreaRow = Database["public"]["Tables"]["delivery_zone_areas"]["Row"];

export function ZonesClient({ zones }: { zones: { zone: ZoneRow; areas: AreaRow[] }[] }) {
  const [editing, setEditing] = useState<ZoneRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<ZoneRow | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Delivery zones</h1>
          <p className="text-sm text-muted-foreground">{zones.length} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New zone
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {zones.map(({ zone, areas }) => (
          <Card key={zone.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {zone.name}
                  <StatusBadge label={zone.is_active ? "active" : "inactive"} tone={activeInactiveTone(zone.is_active)} />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AED {zone.base_delivery_fee} delivery · AED {zone.minimum_order_amount} minimum
                  {zone.same_day_available ? " · Same-day" : ""}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="icon-xs" variant="outline" aria-label="Edit zone" onClick={() => setEditing(zone)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button size="icon-xs" variant="destructive" aria-label="Delete zone" onClick={() => setDeleting(zone)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {areas.map((area) => (
                  <span
                    key={area.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {area.area_name}
                    <button
                      type="button"
                      aria-label={`Remove ${area.area_name}`}
                      onClick={() => startTransition(() => removeZoneAreaAction(area.id))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                {areas.length === 0 ? <p className="text-xs text-muted-foreground">No areas added yet.</p> : null}
              </div>
              <form action={addZoneAreaAction.bind(null, zone.id)} className="flex gap-2">
                <Input name="areaName" placeholder="Add area (e.g. Jumeirah 1)" className="h-7 text-sm" />
                <Button type="submit" size="xs" variant="secondary">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <Drawer
        title={editing === "new" ? "New delivery zone" : "Edit delivery zone"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        {editing !== null ? (
          <ZoneForm
            zone={editing === "new" ? undefined : editing}
            action={editing === "new" ? createZoneAction : updateZoneAction.bind(null, editing.id)}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete delivery zone?"
        description={`"${deleting?.name}" will no longer be offered at checkout.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await deleteZoneAction(deleting.id);
        }}
      />
    </div>
  );
}

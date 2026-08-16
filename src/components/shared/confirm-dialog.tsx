"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Generic "are you sure?" wrapper around any zero-argument async action
 * (typically a Server Action bound to an id via .bind(null, id)).
 *
 * Pass `trigger` for the common case (an element that opens the dialog,
 * via Base UI's `render` pattern on DialogTrigger). Omit it and pass
 * `open`/`onOpenChange` instead when the opener lives somewhere that
 * can't cleanly nest a DialogTrigger — e.g. a dropdown menu item, whose
 * own close-on-click behavior would otherwise race the dialog opening.
 */
export function ConfirmDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
}: {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = trigger ? uncontrolledOpen : (controlledOpen ?? false);
  const setOpen = trigger ? setUncontrolledOpen : (setControlledOpen ?? (() => {}));
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await onConfirm();
                setOpen(false);
              });
            }}
          >
            {isPending ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

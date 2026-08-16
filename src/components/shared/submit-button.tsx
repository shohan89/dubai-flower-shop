"use client";

import { useFormStatus } from "react-dom";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant,
  size,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
} & VariantProps<typeof buttonVariants>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant} size={size}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

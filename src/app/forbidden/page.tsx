import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Access denied",
};

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary px-4 text-center">
      <p className="font-sans text-sm tracking-[0.3em] text-brand-gold uppercase">403</p>
      <h1 className="font-heading text-3xl text-primary">Access denied</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your account doesn&apos;t have permission to view this page. If you
        think this is a mistake, contact a store administrator.
      </p>
      <Button nativeButton={false} render={<Link href="/">Return home</Link>} />
    </main>
  );
}

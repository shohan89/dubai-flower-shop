import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign in required",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary px-4 text-center">
      <p className="font-sans text-sm tracking-[0.3em] text-brand-gold uppercase">401</p>
      <h1 className="font-heading text-3xl text-primary">Sign in required</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You need to be signed in to view this page.
      </p>
      <Button nativeButton={false} render={<Link href="/login">Sign in</Link>} />
    </main>
  );
}

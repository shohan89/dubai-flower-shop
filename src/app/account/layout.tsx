import Link from "next/link";
import { requireCustomerAccess } from "@/services/authorization.service";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireCustomerAccess();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <Link href="/" className="font-heading text-xl text-primary">
            Dubai Flower Shop
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

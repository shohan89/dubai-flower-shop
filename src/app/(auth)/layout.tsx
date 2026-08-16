import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-secondary px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <Link
          href="/"
          className="block text-center font-heading text-2xl text-primary"
        >
          Dubai Flower Shop
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}

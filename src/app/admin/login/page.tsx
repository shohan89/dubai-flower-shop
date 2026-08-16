import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <p className="font-sans text-xs tracking-[0.3em] text-brand-gold uppercase">
            Dubai Flower Shop
          </p>
          <h1 className="font-heading text-2xl text-brand-secondary">
            Admin Dashboard
          </h1>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-lg">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}

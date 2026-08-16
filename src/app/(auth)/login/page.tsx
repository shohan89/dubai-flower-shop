import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to track orders, manage your wishlist, and check out faster.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}

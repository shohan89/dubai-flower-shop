import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Save addresses, track orders, and build your wishlist.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}

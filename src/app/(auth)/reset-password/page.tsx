import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/services/authorization.service";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
};

export default async function ResetPasswordPage() {
  // A valid session here means the recovery link's token was already
  // verified by /auth/confirm — updateUser() below relies on it.
  const context = await getCurrentUser();

  if (!context) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-heading text-2xl text-foreground">Link expired</h1>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Request a new one
          to continue.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl text-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginAction, type AdminLoginActionState } from "@/app/admin/login/actions";

const initialState: AdminLoginActionState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-brand-secondary">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-white/15 bg-white/5 text-brand-secondary placeholder:text-brand-secondary/40"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-brand-secondary">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-white/15 bg-white/5 text-brand-secondary placeholder:text-brand-secondary/40"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-gold text-primary hover:bg-brand-gold/90"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

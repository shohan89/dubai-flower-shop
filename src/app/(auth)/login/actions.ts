"use server";

import { redirect } from "next/navigation";
import { signInSchema } from "@/validations/auth.schema";
import { signInWithPassword } from "@/services/auth.service";

export type LoginActionState = { error?: string };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signInWithPassword(parsed.data.email, parsed.data.password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }

  redirect("/account");
}

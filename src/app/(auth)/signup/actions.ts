"use server";

import { signUpSchema } from "@/validations/auth.schema";
import { signUpWithPassword } from "@/services/auth.service";

export type SignUpActionState = { error?: string; success?: boolean };

export async function signUpAction(
  _prevState: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signUpWithPassword(parsed.data.email, parsed.data.password, parsed.data.fullName);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create account",
    };
  }

  return { success: true };
}

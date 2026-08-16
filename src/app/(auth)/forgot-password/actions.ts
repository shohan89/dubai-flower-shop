"use server";

import { forgotPasswordSchema } from "@/validations/auth.schema";
import { requestPasswordReset } from "@/services/auth.service";

export type ForgotPasswordActionState = { error?: string; success?: boolean };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await requestPasswordReset(parsed.data.email);
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}

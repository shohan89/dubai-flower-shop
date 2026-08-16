"use server";

import { redirect } from "next/navigation";
import { resetPasswordSchema } from "@/validations/auth.schema";
import { updatePassword } from "@/services/auth.service";

export type ResetPasswordActionState = { error?: string };

export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updatePassword(parsed.data.password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reset password",
    };
  }

  redirect("/login?resetSuccess=1");
}

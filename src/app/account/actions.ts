"use server";

import { redirect } from "next/navigation";
import { updateProfileSchema } from "@/validations/profile.schema";
import { updateMyProfile } from "@/services/profile.service";
import { requireAuth, AuthError } from "@/services/authorization.service";

export type UpdateProfileActionState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prevState: UpdateProfileActionState,
  formData: FormData,
): Promise<UpdateProfileActionState> {
  let userId: string;
  try {
    const context = await requireAuth();
    userId = context.user.id;
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updateMyProfile(userId, parsed.data);
  } catch {
    return { error: "Could not update your profile. Please try again." };
  }

  return { success: true };
}

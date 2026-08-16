"use server";

import { redirect } from "next/navigation";
import { signInSchema } from "@/validations/auth.schema";
import { signInWithPassword, signOut } from "@/services/auth.service";
import { getCurrentUser } from "@/services/authorization.service";
import { hasAnyStaffAccess } from "@/constants/permissions";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/services/audit.service";

export type AdminLoginActionState = { error?: string };

export async function adminLoginAction(
  _prevState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
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
    return { error: error instanceof Error ? error.message : "Sign in failed" };
  }

  const context = await getCurrentUser();
  if (!context || !hasAnyStaffAccess(context.roles)) {
    // Signed-in credentials were valid but this account has no staff role
    // (e.g. a customer account) — don't leave a dashboard-eligible
    // session sitting around.
    await signOut();
    return { error: "This account does not have admin access." };
  }

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    actorId: context.user.id,
    actorEmail: context.user.email ?? null,
    action: "admin_sign_in",
    resourceType: "session",
  });

  redirect("/admin/dashboard");
}

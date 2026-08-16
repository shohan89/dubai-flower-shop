"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/services/auth.service";

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/login");
}

export async function adminSignOutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}

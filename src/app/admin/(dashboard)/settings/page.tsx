import type { Metadata } from "next";
import { requireAdminAccess } from "@/services/authorization.service";
import { getAllSettings } from "@/services/settings.service";
import { SettingsClient } from "@/components/admin/settings/settings-client";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdminAccess("settings");
  const settings = await getAllSettings();

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl text-foreground">Settings</h1>
      <SettingsClient {...settings} />
    </div>
  );
}

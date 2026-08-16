import type { Metadata } from "next";
import { requireCustomerAccess } from "@/services/authorization.service";
import { getMyProfile } from "@/services/profile.service";
import { ProfileForm } from "@/components/auth/profile-form";

export const metadata: Metadata = {
  title: "Your account",
};

export default async function AccountPage() {
  const { user } = await requireCustomerAccess();
  const profile = await getMyProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your name and contact details.
        </p>
      </div>
      <ProfileForm
        fullName={profile?.full_name ?? null}
        phone={profile?.phone ?? null}
        email={user.email ?? ""}
      />
    </div>
  );
}

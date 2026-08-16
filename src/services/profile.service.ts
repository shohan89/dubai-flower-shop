import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  getProfileById,
  updateProfile as updateProfileRepo,
} from "@/repositories/profile.repository";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/validations/profile.schema";

/**
 * Callers must have already established `userId` via `requireAuth()` —
 * this service trusts the id it's given rather than re-deriving it, so
 * it stays usable from any authenticated context. RLS (`id = auth.uid()`)
 * is still the backstop even if a caller got this wrong.
 */

export async function getMyProfile(userId: string) {
  const supabase = await createClient();
  return getProfileById(supabase, userId);
}

export async function updateMyProfile(userId: string, input: UpdateProfileInput) {
  const parsed = updateProfileSchema.parse(input);
  const supabase = await createClient();
  return updateProfileRepo(supabase, userId, {
    full_name: parsed.fullName,
    phone: parsed.phone || null,
  });
}

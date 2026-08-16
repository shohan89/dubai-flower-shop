import "server-only";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env/public";

/**
 * Session/credential flows only (sign up, sign in, sign out, password
 * reset, email OTP verification) — these run pre-auth or manage the
 * session itself, so they don't call requireAuth(). Anything that reads
 * or writes data on behalf of an authenticated user (e.g. the profile)
 * lives in its own service and is gated by the caller via requireAuth().
 */

export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/account`,
    },
  });
  if (error) throw error;
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Always resolves without revealing whether the email exists — matches
 * Supabase's own `resetPasswordForEmail` behavior, which returns success
 * regardless (prevents account enumeration). Genuine failures (rate
 * limiting, network) still throw.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`,
  });
  if (error) throw error;
}

/** Sets a new password for the current (recovery) session. */
export async function updatePassword(newPassword: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Used by the /auth/confirm route to verify signup/recovery/email-change links. */
export async function verifyEmailOtp(
  tokenHash: string,
  type: EmailOtpType,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error) throw error;
}

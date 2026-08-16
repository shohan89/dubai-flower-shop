import { type EmailOtpType } from "@supabase/supabase-js";
import type { Route } from "next";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { verifyEmailOtp } from "@/services/auth.service";

/**
 * Handles Supabase email action links (signup confirmation, password
 * recovery, email change) via the `token_hash` + `type` OTP format —
 * this is the URL Supabase's default email templates point at.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next");
  // Only allow same-origin relative paths — `next` is attacker-craftable
  // query-string input, so an unvalidated absolute/protocol-relative URL
  // here would be an open redirect.
  const next =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/";

  let verified = false;
  if (tokenHash && type) {
    try {
      await verifyEmailOtp(tokenHash, type);
      verified = true;
    } catch {
      verified = false;
    }
  }

  // `redirect()` throws internally — must be called outside any try/catch.
  if (verified) {
    redirect(next as Route);
  }
  redirect("/login?error=invalid-link");
}

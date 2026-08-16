"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/authorization.service";
import { moderateReview } from "@/services/review.service";
import { logAuditEvent } from "@/services/audit.service";
import { createClient } from "@/lib/supabase/server";

export async function moderateReviewAction(
  id: string,
  status: "approved" | "rejected",
): Promise<void> {
  const { user } = await requirePermission("reviews");
  await moderateReview(id, status);

  const supabase = await createClient();
  await logAuditEvent(supabase, {
    actorId: user.id,
    actorEmail: user.email ?? null,
    action: "review_moderated",
    resourceType: "review",
    resourceId: id,
    metadata: { status },
  });

  revalidatePath("/admin/reviews");
}

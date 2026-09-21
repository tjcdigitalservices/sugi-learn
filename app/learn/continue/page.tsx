import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { resolveLearnerContinuePath } from "@/lib/learner/continue-path";
import { isAdminRole } from "@/types/auth";

export const dynamic = "force-dynamic";

/**
 * Post-auth entry: sends learners to onboarding, pre-test, or home based on
 * saved progress. Login/register navigate here after a full page load so
 * session cookies are available.
 */
export default async function LearnerContinuePage() {
  const auth = await requireUser("/");

  if (isAdminRole(auth.profile.role)) {
    redirect("/admin");
  }

  redirect(
    await resolveLearnerContinuePath(
      auth.profile.id,
      auth.profile.displayName,
    ),
  );
}

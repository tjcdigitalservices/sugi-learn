import { LearnerShell } from "@/components/learner/learner-shell";
import { isPostAssessmentUnlocked } from "@/lib/assessment/post-access";
import { requireUser } from "@/lib/auth/session";
import { getCurrentLearnerId } from "@/lib/domain/learner-progress";
import { hasSupabaseConfig } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userLabel: string | null = null;
  let isGuest = false;
  let postTestUnlocked = false;

  if (hasSupabaseConfig()) {
    const auth = await requireUser();
    userLabel = auth.profile.displayName ?? auth.user.email ?? "Learner";
    isGuest = auth.user.isAnonymous;

    try {
      const learnerId = await getCurrentLearnerId();
      postTestUnlocked = await isPostAssessmentUnlocked(learnerId);
    } catch {
      postTestUnlocked = false;
    }
  } else {
    postTestUnlocked = true;
  }

  return (
    <LearnerShell
      userLabel={userLabel}
      isGuest={isGuest}
      postTestUnlocked={postTestUnlocked}
    >
      {children}
    </LearnerShell>
  );
}

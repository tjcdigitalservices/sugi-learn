import { LearnerShell } from "@/components/learner/learner-shell";
import { requireUser } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userLabel: string | null = null;

  if (hasSupabaseConfig()) {
    const auth = await requireUser();
    userLabel = auth.profile.displayName ?? auth.user.email ?? "Learner";
  }

  return <LearnerShell userLabel={userLabel}>{children}</LearnerShell>;
}

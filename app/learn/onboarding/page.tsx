import { redirect } from "next/navigation";

import { HeritageAuthShell } from "@/components/auth/heritage-auth-shell";
import { LearnerOnboardingForm } from "@/components/learner/learner-onboarding-form";
import { requireUser } from "@/lib/auth/session";
import { learnerNeedsOnboarding } from "@/lib/learner/onboarding";

export default async function LearnerOnboardingPage() {
  const auth = await requireUser();

  if (auth.profile.role === "admin") {
    redirect("/admin");
  }

  if (!learnerNeedsOnboarding(auth.profile.displayName)) {
    redirect("/learn/assessment/pre");
  }

  return (
    <HeritageAuthShell>
      <LearnerOnboardingForm />
    </HeritageAuthShell>
  );
}

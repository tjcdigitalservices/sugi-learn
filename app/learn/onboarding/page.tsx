import { redirect } from "next/navigation";

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
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-2 py-4">
      <LearnerOnboardingForm />
    </div>
  );
}

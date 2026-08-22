"use client";

import { usePathname } from "next/navigation";

import { LearnerHeader } from "@/components/learner/learner-header";

interface LearnerShellProps {
  children: React.ReactNode;
  userLabel?: string | null;
}

export function LearnerShell({ children, userLabel }: LearnerShellProps) {
  const pathname = usePathname();
  const isAuthStylePage = pathname.startsWith("/learn/onboarding");

  if (isAuthStylePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-sl-cream font-body text-sl-ink">
      <LearnerHeader userLabel={userLabel} />
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

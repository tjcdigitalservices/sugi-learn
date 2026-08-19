import { LearnerHeader } from "@/components/learner/learner-header";

interface LearnerShellProps {
  children: React.ReactNode;
  userLabel?: string | null;
}

export function LearnerShell({ children, userLabel }: LearnerShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-sl-cream font-body text-sl-ink">
      <LearnerHeader userLabel={userLabel} />
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

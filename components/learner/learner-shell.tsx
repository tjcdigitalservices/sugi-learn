"use client";

import { usePathname } from "next/navigation";

import { LearnerHeader } from "@/components/learner/learner-header";

interface LearnerShellProps {
  children: React.ReactNode;
  userLabel?: string | null;
}

/** Individual chapter storybook route — not the chapters index. */
function isChapterBookView(pathname: string): boolean {
  return /^\/learn\/chapters\/[^/]+/.test(pathname);
}

export function LearnerShell({ children, userLabel }: LearnerShellProps) {
  const pathname = usePathname();
  const isAuthStylePage = pathname.startsWith("/learn/onboarding");
  const isBookView = isChapterBookView(pathname);

  if (isAuthStylePage) {
    return <>{children}</>;
  }

  if (isBookView) {
    return (
      <div className="sb-book-view flex h-dvh min-h-0 flex-col overflow-hidden bg-sl-cream font-body text-sl-ink">
        {/* Mobile: keep learner nav visible. Desktop: immersive book (no header). */}
        <div className="sb-book-view-header shrink-0 md:hidden">
          <LearnerHeader userLabel={userLabel} />
        </div>
        <main className="flex min-h-0 flex-1 flex-col px-2 py-1 sm:px-3 md:px-3 md:py-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-sl-cream font-body text-sl-ink">
      <LearnerHeader userLabel={userLabel} />
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

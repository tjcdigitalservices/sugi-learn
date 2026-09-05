import { cookies } from "next/headers";

import { STORYBOOK_PAGE_TURN_COOKIE } from "@/lib/chapter/storybook-session";

export default async function LearnerChapterLoading() {
  const jar = await cookies();
  if (jar.get(STORYBOOK_PAGE_TURN_COOKIE)?.value === "1") {
    // Storybook page-turn: keep previous/hold UI; do not flash skeleton.
    return null;
  }

  return (
    <div
      className="mx-auto max-w-3xl animate-pulse space-y-8 pb-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="space-y-3 border-b pb-6">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full max-w-xl rounded bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-24 rounded bg-muted/60" />
        <div className="h-24 rounded bg-muted/60" />
      </div>
    </div>
  );
}

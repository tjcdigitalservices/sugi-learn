import Link from "next/link";

import { ProgressStatusBadge } from "@/components/learner/progress-status-badge";
import type { ChapterJourneyItem } from "@/types/progress";

interface ChapterJourneyListProps {
  chapters: ChapterJourneyItem[];
  continueChapterId?: string | null;
}

export function ChapterJourneyList({
  chapters,
  continueChapterId,
}: ChapterJourneyListProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        No chapters are available yet.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {chapters.map((chapter) => {
        const isContinueTarget = chapter.id === continueChapterId;

        return (
          <li key={chapter.id}>
            <Link
              href={`/learn/chapters/${chapter.id}`}
              className={`flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between ${
                isContinueTarget ? "bg-primary/5" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Chapter {chapter.number}
                </p>
                <p className="font-medium">{chapter.title}</p>
                {chapter.subtitle ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {chapter.subtitle}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ProgressStatusBadge status={chapter.status} />
                {!chapter.hasPublishedContent ? (
                  <span className="text-xs text-muted-foreground">
                    Coming soon
                  </span>
                ) : null}
                {isContinueTarget ? (
                  <span className="text-xs font-medium text-primary">
                    Continue here
                  </span>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

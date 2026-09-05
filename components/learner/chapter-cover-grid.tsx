import Link from "next/link";
import { Lock } from "lucide-react";

import type { ChapterJourneyItem } from "@/types/progress";
import { cn } from "@/lib/utils";

interface ChapterCoverGridProps {
  chapters: ChapterJourneyItem[];
}

export function ChapterCoverGrid({ chapters }: ChapterCoverGridProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        No chapters are available yet.
      </div>
    );
  }

  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chapters.map((chapter) => {
        const cover = (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[color:rgba(44,36,22,0.12)] bg-sl-navy/90 shadow-sm sm:aspect-[16/10] sm:rounded-xl sm:shadow-md">
            {chapter.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={chapter.coverUrl}
                alt=""
                className={cn(
                  "h-full w-full object-cover transition",
                  chapter.isLocked ? "brightness-75 saturate-75" : null,
                )}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-[0.7rem] leading-snug text-white/80 sm:px-4 sm:text-sm">
                Chapter {chapter.number}: {chapter.title}
              </div>
            )}

            {chapter.isLocked ? (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/45"
                aria-hidden="true"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-[2px] sm:h-14 sm:w-14">
                  <Lock className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={1.75} />
                </span>
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-5 sm:px-3 sm:pb-2.5 sm:pt-8">
              <p className="truncate text-[0.7rem] font-medium text-white sm:text-sm">
                {chapter.title}
              </p>
            </div>
          </div>
        );

        return (
          <li key={chapter.id}>
            {chapter.isUnlocked ? (
              <Link
                href={`/learn/chapters/${chapter.id}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold focus-visible:ring-offset-2"
                aria-label={`Open chapter ${chapter.number}: ${chapter.title}`}
              >
                {cover}
              </Link>
            ) : (
              <div
                className="cursor-not-allowed select-none"
                aria-disabled="true"
                aria-label={`Chapter ${chapter.number}: ${chapter.title} is locked`}
              >
                {cover}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

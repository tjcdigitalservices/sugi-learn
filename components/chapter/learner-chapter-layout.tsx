import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ChapterEngine } from "@/components/chapter/chapter-engine";
import { CompleteChapterButton } from "@/components/chapter/complete-chapter-button";
import type { Chapter } from "@/types/chapter";
import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";
import type { ChapterProgressStatus } from "@/types/progress";

interface LearnerChapterLayoutProps {
  chapter: Chapter;
  navigation: ChapterNavigation;
  progressStatus: ChapterProgressStatus;
  nextChapterId?: string | null;
}

/**
 * Learner chapter view — Chapter Engine for approved sections, plus
 * navigation and an explicit complete action (no completion section required).
 */
export function LearnerChapterLayout({
  chapter,
  navigation,
  progressStatus,
  nextChapterId = navigation.next?.id ?? null,
}: LearnerChapterLayoutProps) {
  const previousChapterId = navigation.previous?.id ?? null;
  const completed = progressStatus === "completed";
  const hasCompletionSection = chapter.sections.some(
    (section) => section.kind === "completion",
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/learn/chapters"
          className="inline-flex items-center gap-1 text-sm text-sl-ink-muted transition hover:text-sl-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All chapters
        </Link>
        <p className="text-sm text-sl-ink-muted">
          {navigation.position} of {navigation.total}
        </p>
      </div>

      <ChapterEngine
        chapter={chapter}
        context="learner"
        chapterCompleted={completed}
        nextChapterId={nextChapterId}
      />

      {!hasCompletionSection ? (
        <CompleteChapterButton chapterId={chapter.id} completed={completed} />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:rgba(44,36,22,0.08)] pt-6">
        {previousChapterId ? (
          <Link
            href={`/learn/chapters/${previousChapterId}`}
            className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2.5 text-sm font-medium text-sl-ink transition hover:bg-[var(--sl-cream-deep)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span />
        )}

        {nextChapterId ? (
          completed ? (
            <Link
              href={`/learn/chapters/${nextChapterId}`}
              className="sl-btn-gold"
            >
              Next Chapter
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.1)] px-4 py-2.5 text-sm font-medium text-sl-ink-muted opacity-40"
            >
              Next Chapter
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )
        ) : completed ? (
          <Link href="/learn/assessment/post" className="sl-btn-gold">
            Take the Post-Test
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.1)] px-4 py-2.5 text-sm font-medium text-sl-ink-muted opacity-40"
          >
            Take the Post-Test
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

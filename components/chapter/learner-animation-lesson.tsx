"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
import { MediaRenderer } from "@/components/chapter/media-renderer";
import { completeChapterAction } from "@/lib/progress/actions";
import type { Chapter, AnimationSection } from "@/types/chapter";
import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";
import type { ChapterProgressStatus } from "@/types/progress";
import type { MediaAsset } from "@/types/media";
import { cn } from "@/lib/utils";

interface LearnerAnimationLessonProps {
  chapter: Chapter;
  navigation: ChapterNavigation;
  progressStatus: ChapterProgressStatus;
  animationSection: AnimationSection | null;
  mediaAssets: MediaAsset[];
  nextChapterId?: string | null;
}

export function LearnerAnimationLesson({
  chapter,
  navigation,
  progressStatus,
  animationSection,
  mediaAssets,
  nextChapterId = navigation.next?.id ?? null,
}: LearnerAnimationLessonProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(progressStatus === "completed");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const asset = animationSection
    ? mediaAssets.find((item) => item.id === animationSection.mediaAssetId)
    : undefined;

  const previousChapterId = navigation.previous?.id ?? null;

  function markComplete() {
    if (completed || isPending) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await completeChapterAction(chapter.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCompleted(true);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href="/learn/chapters"
        className="inline-flex items-center gap-1 text-sm text-sl-ink-muted transition hover:text-sl-navy"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        All chapters
      </Link>

      <article className="sl-card relative overflow-hidden">
        <div className="space-y-5 px-4 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-sl-ink-muted">
            <p>
              Chapter {chapter.number}: {chapter.title}
            </p>
            <p>
              {navigation.position} of {navigation.total}
            </p>
          </div>

          {animationSection ? (
            <MediaRenderer
              asset={asset}
              kind="animation"
              emptyMessage="Animation not available yet. An approved 2D animation video has not been published for this chapter."
              onEnded={markComplete}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-[color:rgba(44,36,22,0.2)] bg-white/60 px-6 py-12 text-center">
              <p className="font-display text-xl text-sl-navy">
                Animation not available yet
              </p>
              <p className="mt-2 text-sm text-sl-ink-muted">
                This chapter does not have an approved 2D animation video for
                learners. Check back later.
              </p>
            </div>
          )}

          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {completed ? (
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              role="status"
            >
              Chapter complete. Your progress has been saved.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:rgba(44,36,22,0.08)] pt-5">
            {previousChapterId ? (
              <Link
                href={`/learn/chapters/${previousChapterId}`}
                className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2.5 text-sm font-medium text-sl-ink transition hover:bg-[var(--sl-cream-deep)]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.1)] px-4 py-2.5 text-sm font-medium text-sl-ink-muted opacity-40"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
            )}

            {nextChapterId ? (
              <Link
                href={`/learn/chapters/${nextChapterId}`}
                aria-disabled={!completed}
                tabIndex={completed ? undefined : -1}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  completed
                    ? "sl-btn-gold"
                    : "pointer-events-none cursor-not-allowed border border-[color:rgba(44,36,22,0.1)] bg-[color:rgba(44,36,22,0.06)] text-sl-ink-muted opacity-50",
                )}
              >
                {isPending ? "Saving…" : "Next Chapter"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
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
                Next Chapter
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <HeritageWave className="h-14" />
      </article>
    </div>
  );
}

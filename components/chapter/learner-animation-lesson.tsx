"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
import { MediaRenderer } from "@/components/chapter/media-renderer";
import { completeChapterAction } from "@/lib/progress/actions";
import type { Chapter, AnimationSection } from "@/types/chapter";
import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";
import type { ChapterProgressStatus } from "@/types/progress";
import type { MediaAsset } from "@/types/media";

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

  function handleComplete() {
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
        <div className="space-y-5 px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-sl-ink-muted">
            <p>
              Chapter {chapter.number}: {chapter.title}
            </p>
            <p>
              Lesson {navigation.position} of {navigation.total}
            </p>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-sl-navy sm:text-3xl">
            {animationSection?.title ?? "2D Animation"}
          </h1>

          {animationSection ? (
            <MediaRenderer
              asset={asset}
              kind="animation"
              emptyMessage="Animation not available yet. An approved 2D animation video has not been published for this chapter."
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

          <div className="space-y-3 border-t border-[color:rgba(44,36,22,0.08)] pt-5">
            {completed ? (
              <div className="space-y-3" role="status">
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Chapter complete. Your progress has been saved.
                </p>
                <div className="flex flex-wrap gap-3">
                  {nextChapterId ? (
                    <Link
                      href={`/learn/chapters/${nextChapterId}`}
                      className="sl-btn-gold"
                    >
                      Continue to next chapter
                    </Link>
                  ) : (
                    <Link href="/learn/assessment/post" className="sl-btn-gold">
                      Take the Post-Test
                    </Link>
                  )}
                  <Link
                    href="/learn"
                    className="inline-flex items-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-5 py-3 text-sm font-medium text-sl-ink transition hover:bg-white"
                  >
                    Return to home
                  </Link>
                </div>
              </div>
            ) : animationSection && asset?.storagePath ? (
              <>
                {error ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="sl-btn-gold"
                  onClick={handleComplete}
                  disabled={isPending}
                >
                  {isPending ? "Saving…" : "I've finished this chapter"}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <HeritageWave className="h-14" />
      </article>
    </div>
  );
}

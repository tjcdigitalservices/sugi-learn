"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { StorybookChapterExperience } from "@/components/chapter/storybook/storybook-chapter-experience";
import type { StorybookTurnDirection } from "@/components/chapter/storybook/storybook-page-turn";
import { useStorybookTransition } from "@/components/chapter/storybook/storybook-transition-provider";
import { prefetchChapterForStorybook } from "@/lib/chapter/storybook-actions";
import {
  clearStorybookPageTurnNav,
  markStorybookArriveOpen,
  markStorybookPageTurnNav,
} from "@/lib/chapter/storybook-session";
import { resolveMediaUrl } from "@/lib/media/resolve-media-url";
import { completeChapterAction } from "@/lib/progress/actions";
import type { Chapter } from "@/types/chapter";
import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";
import type { ChapterProgressStatus } from "@/types/progress";

interface LearnerChapterLayoutProps {
  chapter: Chapter;
  navigation: ChapterNavigation;
  progressStatus: ChapterProgressStatus;
  nextChapterId?: string | null;
  /**
   * Admin preview: same storybook UX, no progress writes.
   * Chapter turns stay on `/admin/chapters/.../preview`.
   */
  previewMode?: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Best-effort warm of destination animation URL — never blocks the turn. */
function warmDestinationMedia(destination: Chapter): void {
  if (typeof document === "undefined") {
    return;
  }

  const animation = [...destination.sections]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((section) => section.kind === "animation");
  if (!animation || animation.kind !== "animation" || !animation.mediaAssetId) {
    return;
  }

  const asset = destination.media.find(
    (item) => item.id === animation.mediaAssetId,
  );
  const url = asset ? resolveMediaUrl(asset.storagePath) : null;
  if (!url) {
    return;
  }

  try {
    const alreadyWarmed = Array.from(
      document.head.querySelectorAll("link[data-sb-media-warm]"),
    ).some((el) => el.getAttribute("data-sb-media-warm") === url);
    if (alreadyWarmed) {
      return;
    }
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = url;
    link.setAttribute("data-sb-media-warm", url);
    document.head.appendChild(link);
  } catch {
    // Ignore preload failures (CSP / unsupported as=video).
  }
}

/**
 * Learner chapter view — storybook cover → open spread with in-book prev/next.
 * Chapter completes via required media (video end, or open when no video).
 */
export function LearnerChapterLayout({
  chapter,
  navigation,
  progressStatus,
  nextChapterId = navigation.next?.id ?? null,
  previewMode = false,
}: LearnerChapterLayoutProps) {
  const router = useRouter();
  const { beginHold, releaseHold, isHolding } = useStorybookTransition();
  const [turnError, setTurnError] = useState<string | null>(null);
  const [chapterDone, setChapterDone] = useState(
    progressStatus === "completed",
  );
  const [previewPostTest, setPreviewPostTest] = useState(false);
  const turnLock = useRef(false);
  const completionPromise = useRef<Promise<void> | null>(
    progressStatus === "completed" ? Promise.resolve() : null,
  );
  const previousChapterId = navigation.previous?.id ?? null;
  const nextTitle = navigation.next?.title ?? null;
  const continueLabel = nextChapterId
    ? nextTitle
      ? `Continue to ${nextTitle}`
      : "Continue to next chapter"
    : "Continue to Post-Test";
  const turning = isHolding;

  const chapterHref = useCallback(
    (slug: string) =>
      previewMode
        ? `/admin/chapters/${slug}/preview`
        : `/learn/chapters/${slug}`,
    [previewMode],
  );

  useEffect(() => {
    const done = progressStatus === "completed";
    setChapterDone(done);
    completionPromise.current = done ? Promise.resolve() : null;
    setTurnError(null);
    setPreviewPostTest(false);
  }, [chapter.id, progressStatus]);

  useEffect(() => {
    if (!isHolding) {
      turnLock.current = false;
    }
  }, [isHolding]);

  const ensureChapterCompleted = useCallback(async () => {
    if (completionPromise.current) {
      await completionPromise.current;
      return;
    }

    if (previewMode) {
      completionPromise.current = Promise.resolve();
      setChapterDone(true);
      return;
    }

    completionPromise.current = (async () => {
      const result = await completeChapterAction(chapter.id);
      if (!result.success) {
        completionPromise.current = null;
        return;
      }
      setChapterDone(true);
      router.refresh();
    })();

    await completionPromise.current;
  }, [chapter.id, previewMode, router]);

  const handleRequiredContentComplete = useCallback(() => {
    void ensureChapterCompleted();
  }, [ensureChapterCompleted]);

  const rollbackTurn = useCallback(() => {
    turnLock.current = false;
    clearStorybookPageTurnNav();
    releaseHold();
  }, [releaseHold]);

  const beginChapterTurn = useCallback(
    async (direction: StorybookTurnDirection, targetSlug: string) => {
      if (!targetSlug || turnLock.current || isHolding) {
        return;
      }
      turnLock.current = true;
      setTurnError(null);

      if (direction === "forward") {
        await ensureChapterCompleted();
      }

      const href = chapterHref(targetSlug);
      try {
        router.prefetch(href);
      } catch {
        // Prefetch is best-effort.
      }

      const reducedMotion = prefersReducedMotion();
      let toChapter: Chapter | null = null;
      try {
        toChapter = await prefetchChapterForStorybook(targetSlug);
      } catch {
        toChapter = null;
      }

      if (!toChapter) {
        rollbackTurn();
        setTurnError(
          "Unable to open the next chapter right now. Please try again.",
        );
        return;
      }

      warmDestinationMedia(toChapter);

      // Freeze the outgoing book + run the turn on the persistent hold layer,
      // then navigate underneath so the animation never dies mid-route.
      flushSync(() => {
        beginHold({
          direction,
          targetSlug,
          outgoingChapter: chapter,
          incomingChapter: toChapter,
          reducedMotion,
          previousChapterId,
          nextChapterId,
          continueLabel,
          chrome: (
            <>
              <Link
                href={
                  previewMode
                    ? `/admin/chapters/${chapter.id}`
                    : "/learn/chapters"
                }
                className="inline-flex items-center gap-1 text-sm text-sl-ink-muted transition hover:text-sl-navy"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {previewMode ? "Back to editor" : "All chapters"}
              </Link>
              <p className="text-sm tracking-wide text-sl-ink-muted">
                Chapter {navigation.position} of {navigation.total}
              </p>
            </>
          ),
        });
      });
      markStorybookPageTurnNav();
      markStorybookArriveOpen();
      router.push(href);
    },
    [
      beginHold,
      chapter,
      chapterHref,
      continueLabel,
      ensureChapterCompleted,
      isHolding,
      navigation.position,
      navigation.total,
      nextChapterId,
      previewMode,
      previousChapterId,
      rollbackTurn,
      router,
    ],
  );

  const handlePrevious = useCallback(() => {
    if (!previousChapterId) {
      return;
    }
    void beginChapterTurn("back", previousChapterId);
  }, [beginChapterTurn, previousChapterId]);

  const handleNext = useCallback(() => {
    if (!chapterDone || !nextChapterId) {
      return;
    }
    void beginChapterTurn("forward", nextChapterId);
  }, [beginChapterTurn, chapterDone, nextChapterId]);

  const handlePostTest = useCallback(() => {
    if (!chapterDone) {
      return;
    }
    void (async () => {
      setTurnError(null);
      await ensureChapterCompleted();
      if (previewMode) {
        setPreviewPostTest(true);
        return;
      }
      router.push("/learn/assessment/post");
    })();
  }, [chapterDone, ensureChapterCompleted, previewMode, router]);

  if (previewMode && previewPostTest) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="sl-card space-y-4 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-sl-navy">
            Next for learners
          </h2>
          <p className="text-sm text-sl-ink-muted">
            After Chapter 13, learners continue to the Post-Test at{" "}
            <span className="font-medium text-sl-navy">
              /learn/assessment/post
            </span>
            . Progress is not saved in admin preview.
          </p>
          <button
            type="button"
            onClick={() => setPreviewPostTest(false)}
            className="sl-btn-gold"
          >
            Back to chapter preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-chapter-stage">
      <div className="sb-chapter-stage-book">
        <StorybookChapterExperience
          chapter={chapter}
          chapterCompleted={chapterDone}
          nextChapterId={nextChapterId}
          previousChapterId={previousChapterId}
          continueLabel={continueLabel}
          turning={turning}
          onRequiredContentComplete={handleRequiredContentComplete}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onPostTest={handlePostTest}
          bookChrome={
            <>
              <Link
                href={
                  previewMode
                    ? `/admin/chapters/${chapter.id}`
                    : "/learn/chapters"
                }
                className="inline-flex items-center gap-1 text-sm text-sl-ink-muted transition hover:text-sl-navy"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {previewMode ? "Back to editor" : "All chapters"}
              </Link>
              <p className="text-sm tracking-wide text-sl-ink-muted">
                Chapter {navigation.position} of {navigation.total}
              </p>
            </>
          }
        />
      </div>

      {turnError ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {turnError}
        </p>
      ) : null}
    </div>
  );
}

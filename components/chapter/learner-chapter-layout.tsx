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
 * Opening the book unlocks Continue immediately; progress saves in the background.
 * Turn busy state lives in StorybookTransitionProvider so it survives remounts
 * and stays visible on the hold overlay until the destination book is ready.
 */
export function LearnerChapterLayout({
  chapter,
  navigation,
  progressStatus,
  nextChapterId = navigation.next?.id ?? null,
  previewMode = false,
}: LearnerChapterLayoutProps) {
  const router = useRouter();
  const {
    beginHold,
    releaseHold,
    beginTurnBusy,
    endTurnBusy,
    turnBusy,
  } = useStorybookTransition();
  const [turnError, setTurnError] = useState<string | null>(null);
  const [chapterDone, setChapterDone] = useState(
    progressStatus === "completed",
  );
  const [previewPostTest, setPreviewPostTest] = useState(false);
  const turnLock = useRef(false);
  const completionPromise = useRef<Promise<void> | null>(
    progressStatus === "completed" ? Promise.resolve() : null,
  );
  const completingForSlug = useRef<string | null>(
    progressStatus === "completed" ? chapter.id : null,
  );
  const previousChapterId = navigation.previous?.id ?? null;
  const nextTitle = navigation.next?.title ?? null;
  const continueLabel = nextChapterId
    ? nextTitle
      ? `Continue to ${nextTitle}`
      : "Continue to next chapter"
    : "Continue to Post-Test";

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
    completingForSlug.current = done ? chapter.id : null;
    setTurnError(null);
    setPreviewPostTest(false);
    // Do not clear turnBusy here — it lives in the provider and must stay
    // until onOpened on the destination chapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  useEffect(() => {
    if (progressStatus === "completed") {
      setChapterDone(true);
      completionPromise.current = Promise.resolve();
      completingForSlug.current = chapter.id;
    }
  }, [chapter.id, progressStatus]);

  useEffect(() => {
    if (!turnBusy) {
      turnLock.current = false;
    }
  }, [turnBusy]);

  const ensureChapterCompleted = useCallback(async () => {
    if (
      completionPromise.current &&
      completingForSlug.current === chapter.id
    ) {
      await completionPromise.current;
      return;
    }

    if (previewMode) {
      completingForSlug.current = chapter.id;
      completionPromise.current = Promise.resolve();
      setChapterDone(true);
      return;
    }

    if (chapterDone && completingForSlug.current === chapter.id) {
      return;
    }

    const chapterSlug = chapter.id;
    completingForSlug.current = chapterSlug;
    setChapterDone(true);

    completionPromise.current = (async () => {
      const result = await completeChapterAction(chapterSlug);
      if (completingForSlug.current !== chapterSlug) {
        return;
      }
      if (!result.success) {
        completionPromise.current = null;
        completingForSlug.current = null;
        setTurnError(result.error);
      }
    })();

    await completionPromise.current;
  }, [chapter.id, chapterDone, previewMode]);

  const handleRequiredContentComplete = useCallback(() => {
    void ensureChapterCompleted();
  }, [ensureChapterCompleted]);

  /** Destination open book is painted and interactive — drop the turn spinner. */
  const handleOpened = useCallback(() => {
    endTurnBusy();
    turnLock.current = false;
    void ensureChapterCompleted();
  }, [endTurnBusy, ensureChapterCompleted]);

  const rollbackTurn = useCallback(() => {
    turnLock.current = false;
    endTurnBusy();
    clearStorybookPageTurnNav();
    releaseHold();
  }, [endTurnBusy, releaseHold]);

  const beginChapterTurn = useCallback(
    async (direction: StorybookTurnDirection, targetSlugValue: string) => {
      if (!targetSlugValue || turnLock.current || turnBusy) {
        return;
      }
      turnLock.current = true;
      flushSync(() => {
        beginTurnBusy();
        setTurnError(null);
      });

      try {
        if (direction === "forward") {
          await ensureChapterCompleted();
        }

        const href = chapterHref(targetSlugValue);
        try {
          router.prefetch(href);
        } catch {
          // Prefetch is best-effort.
        }

        const reducedMotion = prefersReducedMotion();
        let toChapter: Chapter | null = null;
        try {
          toChapter = await prefetchChapterForStorybook(targetSlugValue);
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

        flushSync(() => {
          beginHold({
            direction,
            targetSlug: targetSlugValue,
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
        // turnBusy stays true until handleOpened on the destination.
      } catch {
        rollbackTurn();
        setTurnError(
          "Unable to open the next chapter right now. Please try again.",
        );
      }
    },
    [
      beginHold,
      beginTurnBusy,
      chapter,
      chapterHref,
      continueLabel,
      ensureChapterCompleted,
      navigation.position,
      navigation.total,
      nextChapterId,
      previousChapterId,
      previewMode,
      rollbackTurn,
      router,
      turnBusy,
    ],
  );

  const handlePrevious = useCallback(() => {
    if (!previousChapterId || turnBusy) {
      return;
    }
    void beginChapterTurn("back", previousChapterId);
  }, [beginChapterTurn, previousChapterId, turnBusy]);

  const handleNext = useCallback(() => {
    if (!nextChapterId || turnBusy) {
      return;
    }
    void beginChapterTurn("forward", nextChapterId);
  }, [beginChapterTurn, nextChapterId, turnBusy]);

  const handlePostTest = useCallback(() => {
    if (turnBusy) {
      return;
    }
    void (async () => {
      setTurnError(null);
      turnLock.current = true;
      flushSync(() => {
        beginTurnBusy();
      });
      try {
        await ensureChapterCompleted();
        if (previewMode) {
          setPreviewPostTest(true);
          turnLock.current = false;
          endTurnBusy();
          return;
        }
        router.push("/learn/assessment/post");
        // Route change unmounts this tree; busy flag resets with provider stay
        // on chapters layout — clear once we're leaving the book.
        endTurnBusy();
      } catch {
        turnLock.current = false;
        endTurnBusy();
        setTurnError(
          "Unable to open the Post-Test right now. Please try again.",
        );
      }
    })();
  }, [
    beginTurnBusy,
    endTurnBusy,
    ensureChapterCompleted,
    previewMode,
    router,
    turnBusy,
  ]);

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
    <div className="sb-chapter-stage" aria-busy={turnBusy || undefined}>
      <div className="sb-chapter-stage-book">
        <StorybookChapterExperience
          chapter={chapter}
          chapterCompleted={chapterDone}
          nextChapterId={nextChapterId}
          previousChapterId={previousChapterId}
          continueLabel={continueLabel}
          turning={turnBusy}
          onOpened={handleOpened}
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

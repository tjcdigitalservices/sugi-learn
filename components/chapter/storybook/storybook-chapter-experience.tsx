"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";

import type { Chapter } from "@/types/chapter";

import { StorybookCover } from "@/components/chapter/storybook/storybook-cover";
import { StorybookSpread } from "@/components/chapter/storybook/storybook-spread";
import { useStorybookTransition } from "@/components/chapter/storybook/storybook-transition-provider";
import { useStorybookLayoutMode } from "@/lib/chapter/storybook-layout-mode";
import { consumeStorybookArriveOpen, peekStorybookArriveOpen } from "@/lib/chapter/storybook-session";
import "@/components/chapter/storybook/storybook-book.css";

type BookPhase = "cover" | "opening" | "open";

/** Fallback if transitionend does not fire (Safari quirks, reduced cases). */
const OPEN_FALLBACK_MS = 850;

interface StorybookChapterExperienceProps {
  chapter: Chapter;
  chapterCompleted?: boolean;
  nextChapterId?: string | null;
  previousChapterId?: string | null;
  continueLabel?: string;
  turning?: boolean;
  /** Fires once when the open spread becomes visible. */
  onOpened?: () => void;
  onRequiredContentComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onPostTest?: () => void;
  /** Optional page-turn overlay while the book is open (Phase 2). */
  pageTurnOverlay?: ReactNode;
  /** Top-of-book chrome (All chapters / Chapter N of M). */
  bookChrome?: ReactNode;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Learner storybook shell: closed cover → CSS open → two-page spread.
 * Presentation only — progress callbacks are owned by the layout.
 */
export function StorybookChapterExperience({
  chapter,
  chapterCompleted = false,
  nextChapterId = null,
  previousChapterId = null,
  continueLabel = "Continue to next chapter",
  turning = false,
  onOpened,
  onRequiredContentComplete,
  onPrevious,
  onNext,
  onPostTest,
  pageTurnOverlay = null,
  bookChrome = null,
}: StorybookChapterExperienceProps) {
  const { releaseHold, targetSlug, isHolding } = useStorybookTransition();
  const layoutMode = useStorybookLayoutMode();
  const [phase, setPhase] = useState<BookPhase>("cover");
  const coverRef = useRef<HTMLButtonElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);
  const openedNotifiedForChapter = useRef<string | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paintFrame = useRef<number | null>(null);

  // Reset cover/open state per chapter; honor arrive-open after page-turn nav.
  useLayoutEffect(() => {
    openedNotifiedForChapter.current = null;
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    if (paintFrame.current !== null) {
      window.cancelAnimationFrame(paintFrame.current);
      paintFrame.current = null;
    }

    const landingFromTurn =
      peekStorybookArriveOpen() ||
      (isHolding && targetSlug === chapter.id);

    if (landingFromTurn) {
      setPhase("open");
    } else {
      setPhase("cover");
    }
    // Only re-run when the chapter changes. isHolding/targetSlug are read from
    // the render that accompanies that chapter swap (hold is already active).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  useEffect(() => {
    return () => {
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
      }
      if (paintFrame.current !== null) {
        window.cancelAnimationFrame(paintFrame.current);
      }
    };
  }, []);

  // When the open destination has painted, signal the hold layer to settle.
  useLayoutEffect(() => {
    if (phase !== "open") {
      return;
    }
    if (openedNotifiedForChapter.current === chapter.id) {
      return;
    }

    const holdTargetsThisChapter =
      targetSlug === null || targetSlug === chapter.id;

    if (!holdTargetsThisChapter) {
      return;
    }

    openedNotifiedForChapter.current = chapter.id;

    paintFrame.current = window.requestAnimationFrame(() => {
      paintFrame.current = window.requestAnimationFrame(() => {
        paintFrame.current = null;
        consumeStorybookArriveOpen();
        releaseHold();
        onOpened?.();
        spreadRef.current?.focus({ preventScroll: true });
      });
    });
  }, [phase, chapter.id, targetSlug, releaseHold, onOpened]);

  // If a hold is active for this chapter but the first paint signal was missed,
  // keep trying to settle once the open spread is up.
  useEffect(() => {
    if (!isHolding || phase !== "open" || targetSlug !== chapter.id) {
      return;
    }
    const timer = window.setTimeout(() => {
      consumeStorybookArriveOpen();
      releaseHold();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [isHolding, phase, targetSlug, chapter.id, releaseHold]);

  function finishOpen() {
    setPhase((current) => (current === "open" ? current : "open"));
  }

  function handleOpen() {
    if (phase !== "cover") {
      return;
    }

    if (prefersReducedMotion()) {
      finishOpen();
      return;
    }

    setPhase("opening");

    fallbackTimer.current = setTimeout(() => {
      finishOpen();
    }, OPEN_FALLBACK_MS);
  }

  function handleCoverTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (phase !== "opening") {
      return;
    }
    if (event.propertyName !== "transform") {
      return;
    }
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    finishOpen();
  }

  if (phase === "open") {
    return (
      <StorybookSpread
        chapter={chapter}
        chapterCompleted={chapterCompleted}
        nextChapterId={nextChapterId}
        previousChapterId={previousChapterId}
        continueLabel={continueLabel}
        turning={turning}
        layoutMode={layoutMode}
        spreadRef={spreadRef}
        pageTurnOverlay={pageTurnOverlay}
        chrome={bookChrome}
        onRequiredContentComplete={onRequiredContentComplete}
        onPrevious={onPrevious}
        onNext={onNext}
        onPostTest={onPostTest}
      />
    );
  }

  return (
    <div className="w-full" onTransitionEnd={handleCoverTransitionEnd}>
      <StorybookCover
        title={chapter.title}
        subtitle={chapter.subtitle}
        chapterNumber={chapter.number}
        coverUrl={chapter.coverUrl}
        opening={phase === "opening"}
        onOpen={handleOpen}
        coverRef={coverRef}
        layoutMode={layoutMode}
        chrome={bookChrome}
      />
    </div>
  );
}

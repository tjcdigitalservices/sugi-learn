"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type TransitionEvent,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type {
  AnimationSection,
  AudioSection,
  Chapter,
  ChapterSection,
  IllustrationSection,
} from "@/types/chapter";
import type { MediaAsset } from "@/types/media";
import type { StorybookLayoutMode } from "@/lib/chapter/storybook-layout-mode";
import { useStorybookLayoutMode } from "@/lib/chapter/storybook-layout-mode";

import { ChapterSummaryExpandable } from "@/components/chapter/chapter-summary-expandable";
import { MediaRenderer } from "@/components/chapter/media-renderer";
import { SectionRenderer } from "@/components/chapter/section-renderer";
import { useCharacterRepresentationNotice } from "@/components/learner/character-representation-provider";
import { resolveMediaUrl } from "@/lib/media/resolve-media-url";

type PagedLeaf = "text" | "video";

interface StorybookSpreadProps {
  chapter: Chapter;
  chapterCompleted: boolean;
  nextChapterId: string | null;
  previousChapterId?: string | null;
  continueLabel?: string;
  turning?: boolean;
  layoutMode?: StorybookLayoutMode;
  spreadRef?: RefObject<HTMLDivElement | null>;
  /** Page-turn overlay rendered over the open book (Phase 2). */
  pageTurnOverlay?: ReactNode;
  /** Top-of-book chrome (All chapters / Chapter N of M). */
  chrome?: ReactNode;
  /** Fires once when the primary open spread has committed layout. */
  onSpreadReady?: () => void;
  onRequiredContentComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onPostTest?: () => void;
}

function sectionHasRenderableMedia(
  section: AnimationSection | IllustrationSection | AudioSection,
  mediaAssets: MediaAsset[],
): boolean {
  const asset = mediaAssets.find((item) => item.id === section.mediaAssetId);
  return Boolean(asset && resolveMediaUrl(asset.storagePath));
}

/** Skip empty draft-like slots so unfinished chapters don’t open a second book. */
function sectionHasContinuationContent(
  section: ChapterSection,
  mediaAssets: MediaAsset[],
): boolean {
  switch (section.kind) {
    case "animation":
    case "illustration":
    case "audio":
      return sectionHasRenderableMedia(section, mediaAssets);
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return Boolean(section.body.trim());
    case "characters":
      return section.characterIds.length > 0;
    case "learning_points":
      return true;
    case "completion":
      return false;
    default:
      return true;
  }
}

function chunkIntoPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

function partitionSections(
  sections: ChapterSection[],
  mediaAssets: MediaAsset[],
): {
  rightAnimation: AnimationSection | null;
  rightIllustration: IllustrationSection | null;
  continuationSections: ChapterSection[];
} {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const animations = sorted.filter(
    (section): section is AnimationSection => section.kind === "animation",
  );
  const illustrations = sorted.filter(
    (section): section is IllustrationSection =>
      section.kind === "illustration",
  );

  const playableAnimations = animations.filter((section) =>
    sectionHasRenderableMedia(section, mediaAssets),
  );
  const playableIllustrations = illustrations.filter((section) =>
    sectionHasRenderableMedia(section, mediaAssets),
  );

  const rightAnimation = playableAnimations[0] ?? null;
  const rightIllustration =
    !rightAnimation && playableIllustrations[0]
      ? playableIllustrations[0]
      : null;
  const rightIllustrationId = rightIllustration?.id ?? null;

  const continuationSections = sorted.filter((section) => {
    if (section.kind === "completion") {
      return false;
    }
    if (section.kind === "animation") {
      return false;
    }
    if (section.kind === "illustration") {
      if (rightAnimation) {
        return false;
      }
      if (section.id === rightIllustrationId) {
        return false;
      }
    }
    return sectionHasContinuationContent(section, mediaAssets);
  });

  return {
    rightAnimation,
    rightIllustration,
    continuationSections,
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const LEAF_TURN_MS = 560;
const LEAF_TURN_REDUCED_MS = 240;

const continuationPageLeft =
  "sb-page space-y-4 border-b border-[color:rgba(44,36,22,0.08)] px-5 py-6 sm:px-7 sm:py-8 md:border-b-0 md:border-r md:border-[color:rgba(44,36,22,0.06)] md:pr-8 lg:pr-9";

const continuationPageRight =
  "sb-page space-y-4 px-5 py-6 sm:px-7 sm:py-8 md:pl-8 lg:pl-9";

const pageChrome =
  "sb-page sb-page--fixed border-b border-[color:rgba(44,36,22,0.08)] px-4 py-4 sm:px-5 sm:py-5 md:border-b-0 md:border-r md:border-[color:rgba(44,36,22,0.06)] md:pr-6 lg:px-6 lg:py-5 lg:pr-7";

const pageChromeRight =
  "sb-page sb-page--fixed px-2 py-3 sm:px-2.5 sm:py-4 md:pl-3 lg:px-2.5 lg:py-4 lg:pl-3";

const pageChromePaged =
  "sb-page sb-page--fixed sb-page--paged-scroll px-4 py-4 sm:px-5 sm:py-5";

/**
 * Open storybook: fixed primary frame (summary | animation-or-illustration)
 * with in-page prev/next footers. Additional sections continue below.
 * Paged mode shows one leaf at a time with a CSS page-turn.
 */
export function StorybookSpread({
  chapter,
  chapterCompleted,
  nextChapterId,
  previousChapterId = null,
  continueLabel = "Continue to next chapter",
  turning = false,
  layoutMode: layoutModeProp,
  spreadRef,
  pageTurnOverlay = null,
  chrome = null,
  onSpreadReady,
  onRequiredContentComplete,
  onPrevious,
  onNext,
  onPostTest,
}: StorybookSpreadProps) {
  const detectedMode = useStorybookLayoutMode();
  const layoutMode = layoutModeProp ?? detectedMode;
  const { shortText: characterRepresentationShort } =
    useCharacterRepresentationNotice();
  const { rightAnimation, rightIllustration, continuationSections } =
    partitionSections(chapter.sections, chapter.media);
  const continuationSpreads = chunkIntoPairs(continuationSections);
  const eyebrow =
    chapter.number > 0 ? `Chapter ${chapter.number}` : "Chapter";
  const hasPlayableVideo = Boolean(rightAnimation);
  const incompleteFallbackFired = useRef(false);
  const readyFired = useRef(false);
  const localRootRef = useRef<HTMLDivElement | null>(null);
  const paged = layoutMode === "paged";

  const setRootRef = (node: HTMLDivElement | null) => {
    localRootRef.current = node;
    if (!spreadRef) {
      return;
    }
    if (typeof spreadRef === "object") {
      spreadRef.current = node;
    }
  };

  const [leaf, setLeaf] = useState<PagedLeaf>("text");
  const [leafTurn, setLeafTurn] = useState<{
    direction: "forward" | "back";
    active: boolean;
    reduced: boolean;
  } | null>(null);
  const leafTurnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLeaf = useRef<PagedLeaf | null>(null);

  useEffect(() => {
    setLeaf("text");
    setLeafTurn(null);
    pendingLeaf.current = null;
    readyFired.current = false;
  }, [chapter.id]);

  useLayoutEffect(() => {
    if (!onSpreadReady || readyFired.current) {
      return;
    }

    const notifyReady = onSpreadReady;
    let cancelled = false;
    let attempts = 0;

    function checkReady() {
      if (cancelled || readyFired.current) {
        return;
      }
      const root = localRootRef.current;
      const frame = root?.querySelector(".sb-frame");
      const title = root?.querySelector(".sb-page h1");
      const rightChrome = root?.querySelector(".sb-media-host, .sb-page-nav");
      const frameWidth = frame?.getBoundingClientRect().width ?? 0;
      if (frame && frameWidth > 0 && title && rightChrome) {
        readyFired.current = true;
        notifyReady();
        return;
      }
      attempts += 1;
      if (attempts < 45) {
        window.requestAnimationFrame(checkReady);
      } else {
        // Layout should have settled; avoid blocking the turn forever.
        readyFired.current = true;
        notifyReady();
      }
    }

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(checkReady);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [chapter.id, onSpreadReady, layoutMode, leaf]);

  useEffect(() => {
    return () => {
      if (leafTurnTimer.current) {
        clearTimeout(leafTurnTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (chapterCompleted || hasPlayableVideo || incompleteFallbackFired.current) {
      return;
    }
    incompleteFallbackFired.current = true;
    onRequiredContentComplete?.();
  }, [chapterCompleted, hasPlayableVideo, onRequiredContentComplete]);

  useLayoutEffect(() => {
    if (!leafTurn || leafTurn.active) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      setLeafTurn((current) =>
        current ? { ...current, active: true } : current,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [leafTurn]);

  function finishLeafTurn() {
    if (pendingLeaf.current) {
      setLeaf(pendingLeaf.current);
      pendingLeaf.current = null;
    }
    setLeafTurn(null);
    if (leafTurnTimer.current) {
      clearTimeout(leafTurnTimer.current);
      leafTurnTimer.current = null;
    }
  }

  function goToLeaf(next: PagedLeaf, direction: "forward" | "back") {
    if (turning || leafTurn || next === leaf) {
      return;
    }

    const reduced = prefersReducedMotion();
    pendingLeaf.current = next;
    setLeafTurn({ direction, active: false, reduced });
    leafTurnTimer.current = setTimeout(
      () => {
        finishLeafTurn();
      },
      reduced ? LEAF_TURN_REDUCED_MS : LEAF_TURN_MS,
    );
  }

  function handleLeafTurnEnd(event: TransitionEvent<HTMLDivElement>) {
    if (!leafTurn) {
      return;
    }
    if (
      event.propertyName !== "transform" &&
      event.propertyName !== "opacity"
    ) {
      return;
    }
    finishLeafTurn();
  }

  function renderSection(section: ChapterSection) {
    return (
      <section key={section.id}>
        <SectionRenderer
          section={section}
          mediaAssets={chapter.media}
          characters={chapter.characters}
          learningPoints={chapter.learningPoints}
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          context="learner"
          chapterCompleted={chapterCompleted}
          nextChapterId={nextChapterId}
        />
      </section>
    );
  }

  function renderRightMedia() {
    if (rightAnimation) {
      const asset = chapter.media.find(
        (item) => item.id === rightAnimation.mediaAssetId,
      );
      return (
        <div className="sb-media-slot">
          <div className="sb-media-slot-fill">
            <MediaRenderer
              asset={asset}
              kind="animation"
              emptyMessage="Animation not available yet."
              onEnded={onRequiredContentComplete}
            />
          </div>
        </div>
      );
    }

    if (rightIllustration) {
      const asset = chapter.media.find(
        (item) => item.id === rightIllustration.mediaAssetId,
      );
      return (
        <div className="sb-media-slot">
          <div className="sb-media-slot-fill">
            <MediaRenderer
              asset={asset}
              kind="illustration"
              emptyMessage="Illustration not available yet."
            />
          </div>
        </div>
      );
    }

    return (
      <div className="sb-media-slot">
        <div className="sb-media-slot-empty">Animation not available yet.</div>
      </div>
    );
  }

  function handleContinue() {
    if (!chapterCompleted || turning) {
      return;
    }
    if (nextChapterId) {
      onNext?.();
      return;
    }
    onPostTest?.();
  }

  const textPage = (
    <div className={`${paged ? pageChromePaged : pageChrome} gap-2`}>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-y-auto overscroll-contain sm:gap-4">
        <div className="shrink-0 space-y-1.5 sm:space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sl-navy">
            {eyebrow}
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-sl-navy sm:text-2xl lg:text-3xl">
            {chapter.title}
          </h1>
          {chapter.subtitle ? (
            <p className="text-xs text-sl-ink-muted sm:text-sm lg:text-base">
              {chapter.subtitle}
            </p>
          ) : null}
        </div>

        {chapter.summary ? (
          <div className="flex flex-col gap-2 border-t border-[color:rgba(44,36,22,0.1)] pt-3 sm:pt-4">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-sl-navy">
              About this chapter
            </p>
            <ChapterSummaryExpandable summary={chapter.summary} />
          </div>
        ) : null}

        <p className="shrink-0 text-[0.7rem] leading-snug text-sl-ink-muted/80 sm:text-xs">
          {characterRepresentationShort}
        </p>
      </div>

      {paged ? (
        <div className="sb-page-nav sb-page-nav--paged sb-page-nav--paged-end shrink-0 pt-2">
          <button
            type="button"
            disabled={turning || Boolean(leafTurn)}
            onClick={() => goToLeaf("video", "forward")}
            className="sb-nav-btn sb-nav-btn--next"
          >
            Next Page
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="sb-page-nav sb-page-nav--prev shrink-0 pt-2">
          {previousChapterId ? (
            <button
              type="button"
              disabled={turning}
              onClick={onPrevious}
              className="sb-nav-btn sb-nav-btn--prev"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous Chapter
            </button>
          ) : null}
        </div>
      )}
    </div>
  );

  const videoPage = (
    <div className={`${paged ? pageChromePaged : pageChromeRight} gap-1.5 sm:gap-2`}>
      <div className="sb-media-host flex min-h-0 flex-1 items-center justify-center">
        {renderRightMedia()}
      </div>

      {paged ? (
        <div className="sb-page-nav sb-page-nav--paged sb-page-nav--paged-split shrink-0 pt-2">
          <button
            type="button"
            disabled={turning || Boolean(leafTurn)}
            onClick={() => goToLeaf("text", "back")}
            className="sb-nav-btn sb-nav-btn--prev"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Previous Page
          </button>
          <button
            type="button"
            disabled={!chapterCompleted || turning || Boolean(leafTurn)}
            onClick={handleContinue}
            className={`sb-nav-btn sb-nav-btn--next${chapterCompleted ? " is-ready" : ""}`}
          >
            {continueLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="sb-page-nav sb-page-nav--next shrink-0 pt-2">
          <button
            type="button"
            disabled={!chapterCompleted || turning}
            onClick={handleContinue}
            className={`sb-nav-btn sb-nav-btn--next${chapterCompleted ? " is-ready" : ""}`}
          >
            {continueLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );

  const frameClass = paged
    ? "sb-spread-shell sb-spread-shell--primary sb-frame sb-frame--paged"
    : "sb-spread-shell sb-spread-shell--primary sb-frame";

  const spreadClass = paged
    ? "sb-spread sb-spread--fixed sb-spread--paged"
    : "sb-spread sb-spread--fixed";

  return (
    <div
      className="w-full"
      ref={setRootRef}
      tabIndex={-1}
      aria-label={`${chapter.title} chapter content`}
    >
      <div
        className={`sb-book-shell sb-book-shell--open${paged ? " sb-book-shell--paged" : ""}`}
      >
        <div className={frameClass}>
          {chrome ? (
            <div className="sb-book-chrome sb-book-chrome--internal">{chrome}</div>
          ) : null}
          <div className={spreadClass}>
            <div className="sb-spine" aria-hidden="true" />
            <div className="sb-spread-grid">
              {paged ? (leaf === "text" ? textPage : videoPage) : null}
              {!paged ? (
                <>
                  {textPage}
                  {videoPage}
                </>
              ) : null}
            </div>

            {leafTurn ? (
              <div
                className={`sb-leaf-turn-root${leafTurn.active ? " is-turning" : ""} ${
                  leafTurn.direction === "forward" ? "is-forward" : "is-back"
                }${leafTurn.reduced ? " sb-leaf-turn-reduced" : ""}`}
                onTransitionEnd={handleLeafTurnEnd}
                aria-hidden="true"
              >
                <div className="sb-leaf-turn-leaf" />
              </div>
            ) : null}
          </div>
          {pageTurnOverlay}
        </div>
      </div>

      {continuationSpreads.map((pair, spreadIndex) => (
        <div
          key={`continuation-${spreadIndex}-${pair[0]?.id ?? "empty"}`}
          className="sb-spread-shell mt-6 sm:mt-8"
        >
          <div className="sb-spread">
            <div className="sb-spine" aria-hidden="true" />
            <div className="grid gap-0 md:grid-cols-2">
              <div className={continuationPageLeft}>
                {renderSection(pair[0])}
              </div>
              {pair[1] ? (
                <div className={continuationPageRight}>
                  {renderSection(pair[1])}
                </div>
              ) : (
                <div
                  className={`${continuationPageRight} hidden min-h-[8rem] md:block`}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

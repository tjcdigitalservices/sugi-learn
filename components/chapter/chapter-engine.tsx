import type { Chapter, ChapterSection } from "@/types/chapter";

import { ChapterEmptyState } from "@/components/chapter/chapter-empty-state";
import { ChapterSummaryExpandable } from "@/components/chapter/chapter-summary-expandable";
import {
  SectionRenderer,
  type ChapterEngineContext,
} from "@/components/chapter/section-renderer";

interface ChapterEngineProps {
  chapter: Chapter;
  /** When false, the wrapper provides the header / hero. */
  showHeader?: boolean;
  context?: ChapterEngineContext;
  chapterCompleted?: boolean;
  nextChapterId?: string | null;
}

function orderSectionsForDisplay(sections: ChapterSection[]): {
  animationSections: ChapterSection[];
  otherSections: ChapterSection[];
} {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    animationSections: sorted.filter((section) => section.kind === "animation"),
    otherSections: sorted.filter((section) => section.kind !== "animation"),
  };
}

/**
 * Reusable chapter renderer — one engine for all chapters.
 * Title and summary sit with the primary media; remaining sections render below.
 */
export function ChapterEngine({
  chapter,
  showHeader = true,
  context = "learner",
  chapterCompleted = false,
  nextChapterId = null,
}: ChapterEngineProps) {
  const { animationSections, otherSections } = orderSectionsForDisplay(
    chapter.sections,
  );
  const hasSections = chapter.sections.length > 0;

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
          context={context}
          chapterCompleted={chapterCompleted}
          nextChapterId={nextChapterId}
        />
      </section>
    );
  }

  const eyebrow =
    chapter.number > 0 ? `Chapter ${chapter.number}` : "Demo";

  return (
    <div className="space-y-8 sm:space-y-10">
      {showHeader ? (
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-sl-navy sm:text-4xl">
              {chapter.title}
            </h1>
            {chapter.subtitle ? (
              <p className="max-w-2xl text-base text-sl-ink-muted sm:text-lg">
                {chapter.subtitle}
              </p>
            ) : null}
          </div>

          <div className="grid items-start gap-8 border-t border-[color:rgba(44,36,22,0.08)] pt-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
            <div className="space-y-2">
              {chapter.summary ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sl-navy">
                    About this chapter
                  </p>
                  <ChapterSummaryExpandable summary={chapter.summary} />
                </>
              ) : null}
            </div>

            <div className="space-y-3">
              {animationSections.length > 0 ? (
                <div className="space-y-6">
                  {animationSections.map(renderSection)}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[color:rgba(44,36,22,0.15)] bg-white/60 px-4 py-10 text-center text-sm text-sl-ink-muted">
                  Animation not available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {hasSections && otherSections.length > 0 ? (
        <div className="space-y-12 sm:space-y-14">
          {otherSections.map(renderSection)}
        </div>
      ) : null}

      {!hasSections && !showHeader ? (
        <ChapterEmptyState context={context} />
      ) : null}
    </div>
  );
}

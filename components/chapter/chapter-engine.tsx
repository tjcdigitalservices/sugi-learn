import type { Chapter, ChapterSection } from "@/types/chapter";

import { ChapterEmptyState } from "@/components/chapter/chapter-empty-state";
import { ChapterHeader } from "@/components/chapter/chapter-header";
import {
  SectionRenderer,
  type ChapterEngineContext,
} from "@/components/chapter/section-renderer";

interface ChapterEngineProps {
  chapter: Chapter;
  /** When false, the wrapper provides the header. */
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
 * Learner/default order: title → Animation / Video → summary → other sections.
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

  return (
    <div className="space-y-10">
      {showHeader ? (
        <ChapterHeader chapter={chapter} showSummary={false} />
      ) : null}

      {!hasSections ? (
        <ChapterEmptyState context={context} />
      ) : (
        <div className="space-y-12 sm:space-y-14">
          {animationSections.map(renderSection)}

          {chapter.summary ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {chapter.summary}
            </p>
          ) : null}

          {otherSections.map(renderSection)}
        </div>
      )}
    </div>
  );
}

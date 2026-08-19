import type { Chapter } from "@/types/chapter";

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

/**
 * Reusable chapter renderer — one engine for all chapters.
 * Content is supplied via the Chapter data model, not hardcoded per chapter.
 */
export function ChapterEngine({
  chapter,
  showHeader = true,
  context = "learner",
  chapterCompleted = false,
  nextChapterId = null,
}: ChapterEngineProps) {
  const sections = [...chapter.sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div className="space-y-10">
      {showHeader ? <ChapterHeader chapter={chapter} /> : null}

      {sections.length === 0 ? (
        <ChapterEmptyState context={context} />
      ) : (
        <div className="space-y-12 sm:space-y-14">
          {sections.map((section) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

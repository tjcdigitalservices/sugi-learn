import { LearnerAnimationLesson } from "@/components/chapter/learner-animation-lesson";
import type { Chapter, AnimationSection } from "@/types/chapter";
import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";
import type { ChapterProgressStatus } from "@/types/progress";

interface LearnerChapterLayoutProps {
  chapter: Chapter;
  navigation: ChapterNavigation;
  progressStatus: ChapterProgressStatus;
  nextChapterId?: string | null;
}

function firstAnimationSection(chapter: Chapter): AnimationSection | null {
  const sections = [...chapter.sections]
    .filter((section): section is AnimationSection => section.kind === "animation")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return sections[0] ?? null;
}

/**
 * Learner chapter view — animation video only (heritage UI).
 * Admin preview continues to use ChapterEngine with all section kinds.
 */
export function LearnerChapterLayout({
  chapter,
  navigation,
  progressStatus,
  nextChapterId = navigation.next?.id ?? null,
}: LearnerChapterLayoutProps) {
  const animationSection = firstAnimationSection(chapter);

  return (
    <LearnerAnimationLesson
      chapter={chapter}
      navigation={navigation}
      progressStatus={progressStatus}
      animationSection={animationSection}
      mediaAssets={chapter.media}
      nextChapterId={nextChapterId}
    />
  );
}

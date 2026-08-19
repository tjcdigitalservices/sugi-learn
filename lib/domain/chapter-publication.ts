import type { Chapter } from "@/types/chapter";
import { isPublishedReviewStatus } from "@/types/review";

/**
 * Applies learner publication rules matching Supabase RLS:
 * only approved sections, learning points, and media are visible.
 */
export function filterChapterForLearner(chapter: Chapter): Chapter {
  return {
    ...chapter,
    sections: chapter.sections.filter((section) =>
      isPublishedReviewStatus(section.reviewStatus),
    ),
    learningPoints: chapter.learningPoints.filter((point) =>
      isPublishedReviewStatus(point.reviewStatus),
    ),
    media: chapter.media.filter((asset) =>
      isPublishedReviewStatus(asset.reviewStatus),
    ),
  };
}

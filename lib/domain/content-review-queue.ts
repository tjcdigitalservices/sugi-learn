import "server-only";

import { listAssessmentsForAdmin, getAssessmentQuestionsForAdmin } from "@/lib/domain/assessment-management";
import { listChaptersForAdmin, getChapterForAdmin } from "@/lib/domain/chapter-management";
import { listMediaAssetsForAdmin } from "@/lib/domain/media-management";
import type { ReviewStatus } from "@/types/review";
import { getReviewStatusLabel, isReviewQueueStatus } from "@/types/review";

export interface ContentReviewQueueItem {
  id: string;
  area: "chapter" | "section" | "learning_point" | "media" | "assessment" | "question";
  title: string;
  subtitle: string | null;
  reviewStatus: ReviewStatus;
  href: string;
}

export interface ContentReviewQueueSummary {
  items: ContentReviewQueueItem[];
  counts: Record<ReviewStatus, number>;
}

function incrementCount(
  counts: Record<ReviewStatus, number>,
  status: ReviewStatus,
): void {
  counts[status] += 1;
}

export async function getContentReviewQueue(): Promise<ContentReviewQueueSummary> {
  const counts: Record<ReviewStatus, number> = {
    draft: 0,
    for_review: 0,
    approved: 0,
    needs_revision: 0,
  };

  const items: ContentReviewQueueItem[] = [];

  const chapters = await listChaptersForAdmin();
  for (const chapter of chapters) {
    incrementCount(counts, chapter.reviewStatus);

    if (isReviewQueueStatus(chapter.reviewStatus)) {
      items.push({
        id: `chapter-${chapter.id}`,
        area: "chapter",
        title: chapter.title,
        subtitle: `Chapter ${chapter.number} metadata`,
        reviewStatus: chapter.reviewStatus,
        href: `/admin/chapters/${chapter.id}`,
      });
    }

    const detail = await getChapterForAdmin(chapter.id);
    if (!detail) {
      continue;
    }

    for (const section of detail.sections) {
      incrementCount(counts, section.reviewStatus);

      if (isReviewQueueStatus(section.reviewStatus)) {
        items.push({
          id: `section-${section.id}`,
          area: "section",
          title: section.title,
          subtitle: `${chapter.title} — ${section.kind.replaceAll("_", " ")}`,
          reviewStatus: section.reviewStatus,
          href: `/admin/chapters/${chapter.id}`,
        });
      }
    }

    for (const point of detail.learningPoints) {
      incrementCount(counts, point.reviewStatus);

      if (isReviewQueueStatus(point.reviewStatus)) {
        items.push({
          id: `learning-point-${point.id}`,
          area: "learning_point",
          title: point.title ?? "Untitled learning point",
          subtitle: `${chapter.title} — learning point`,
          reviewStatus: point.reviewStatus,
          href: `/admin/chapters/${chapter.id}`,
        });
      }
    }
  }

  const mediaAssets = await listMediaAssetsForAdmin({});
  for (const asset of mediaAssets) {
    incrementCount(counts, asset.reviewStatus);

    if (isReviewQueueStatus(asset.reviewStatus)) {
      items.push({
        id: `media-${asset.id}`,
        area: "media",
        title: asset.title ?? "Untitled media asset",
        subtitle: asset.chapterSlug
          ? `Chapter: ${asset.chapterSlug}`
          : "Unassigned media",
        reviewStatus: asset.reviewStatus,
        href: `/admin/media/${asset.id}`,
      });
    }
  }

  const assessments = await listAssessmentsForAdmin();
  for (const assessment of assessments) {
    incrementCount(counts, assessment.reviewStatus);

    if (isReviewQueueStatus(assessment.reviewStatus)) {
      items.push({
        id: `assessment-${assessment.id}`,
        area: "assessment",
        title: assessment.title,
        subtitle: assessment.type === "pre" ? "Pre-Assessment" : "Post-Assessment",
        reviewStatus: assessment.reviewStatus,
        href: `/admin/assessments/${assessment.id}`,
      });
    }

    const detailQuestions = await getAssessmentQuestionsForAdmin(assessment.id);

    for (const question of detailQuestions) {
      incrementCount(counts, question.reviewStatus);

      if (isReviewQueueStatus(question.reviewStatus)) {
        items.push({
          id: `question-${question.id}`,
          area: "question",
          title: question.prompt,
          subtitle: `${assessment.title} — question ${question.sortOrder + 1}`,
          reviewStatus: question.reviewStatus,
          href: `/admin/assessments/${assessment.id}`,
        });
      }
    }
  }

  items.sort((left, right) => {
    const statusOrder = (status: ReviewStatus) => {
      if (status === "needs_revision") {
        return 0;
      }
      if (status === "for_review") {
        return 1;
      }
      return 2;
    };

    const orderDiff = statusOrder(left.reviewStatus) - statusOrder(right.reviewStatus);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return left.title.localeCompare(right.title);
  });

  return {
    items,
    counts,
  };
}

export function formatReviewQueueArea(
  area: ContentReviewQueueItem["area"],
): string {
  switch (area) {
    case "learning_point":
      return "Learning point";
    case "chapter":
      return "Chapter";
    case "section":
      return "Section";
    case "media":
      return "Media";
    case "assessment":
      return "Assessment";
    case "question":
      return "Question";
    default:
      return area;
  }
}

export { getReviewStatusLabel };

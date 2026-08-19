import "server-only";

import {
  listAssessmentsForAdmin,
  getAssessmentQuestionsForAdmin,
} from "@/lib/domain/assessment-management";
import {
  listChaptersForAdmin,
  getChapterForAdmin,
} from "@/lib/domain/chapter-management";
import { listMediaAssetsForAdmin } from "@/lib/domain/media-management";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type { ReviewStatus } from "@/types/review";
import { getReviewStatusLabel, isReviewQueueStatus } from "@/types/review";

export interface ContentReviewQueueItem {
  id: string;
  area:
    | "chapter"
    | "section"
    | "learning_point"
    | "media"
    | "assessment"
    | "question";
  title: string;
  subtitle: string | null;
  reviewStatus: ReviewStatus;
  href: string;
}

export interface ContentReviewQueueSummary {
  items: ContentReviewQueueItem[];
  counts: Record<ReviewStatus, number>;
}

function emptyCounts(): Record<ReviewStatus, number> {
  return {
    draft: 0,
    for_review: 0,
    approved: 0,
    needs_revision: 0,
  };
}

function incrementCount(
  counts: Record<ReviewStatus, number>,
  status: ReviewStatus,
): void {
  counts[status] += 1;
}

function sortQueueItems(items: ContentReviewQueueItem[]): void {
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

    const orderDiff =
      statusOrder(left.reviewStatus) - statusOrder(right.reviewStatus);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return left.title.localeCompare(right.title);
  });
}

/**
 * Fast path: a few bulk selects instead of loading every chapter in full
 * (the previous N+1 loop made /admin/review appear to load forever).
 */
async function getContentReviewQueueFromSupabase(): Promise<ContentReviewQueueSummary> {
  const supabase = await getSupabaseServerClient();
  const counts = emptyCounts();
  const items: ContentReviewQueueItem[] = [];

  const [
    chaptersResult,
    sectionsResult,
    pointsResult,
    mediaResult,
    assessmentsResult,
    questionsResult,
  ] = await Promise.all([
    supabase
      .from("chapters")
      .select("id, slug, chapter_number, title, review_status")
      .order("chapter_number", { ascending: true }),
    supabase
      .from("chapter_sections")
      .select("id, chapter_id, kind, title, review_status"),
    supabase
      .from("learning_points")
      .select("id, chapter_id, title, review_status"),
    supabase
      .from("media_assets")
      .select("id, title, chapter_id, review_status"),
    supabase.from("assessments").select("id, type, title, review_status"),
    supabase
      .from("questions")
      .select("id, assessment_id, prompt, sort_order, review_status"),
  ]);

  const firstError =
    chaptersResult.error ??
    sectionsResult.error ??
    pointsResult.error ??
    mediaResult.error ??
    assessmentsResult.error ??
    questionsResult.error;

  if (firstError) {
    throw new Error(`Unable to load review queue: ${firstError.message}`);
  }

  const chapters = chaptersResult.data ?? [];
  const chapterById = new Map(
    chapters.map((chapter) => [
      chapter.id,
      {
        slug: chapter.slug,
        title: chapter.title,
        number: chapter.chapter_number,
      },
    ]),
  );

  for (const chapter of chapters) {
    const status = chapter.review_status as ReviewStatus;
    incrementCount(counts, status);
    if (isReviewQueueStatus(status)) {
      items.push({
        id: `chapter-${chapter.slug}`,
        area: "chapter",
        title: chapter.title,
        subtitle: `Chapter ${chapter.chapter_number} metadata`,
        reviewStatus: status,
        href: `/admin/chapters/${chapter.slug}`,
      });
    }
  }

  for (const section of sectionsResult.data ?? []) {
    const status = section.review_status as ReviewStatus;
    incrementCount(counts, status);
    if (!isReviewQueueStatus(status)) {
      continue;
    }
    const chapter = chapterById.get(section.chapter_id);
    items.push({
      id: `section-${section.id}`,
      area: "section",
      title: section.title,
      subtitle: chapter
        ? `${chapter.title} — ${String(section.kind).replaceAll("_", " ")}`
        : String(section.kind).replaceAll("_", " "),
      reviewStatus: status,
      href: chapter ? `/admin/chapters/${chapter.slug}` : "/admin/chapters",
    });
  }

  for (const point of pointsResult.data ?? []) {
    const status = point.review_status as ReviewStatus;
    incrementCount(counts, status);
    if (!isReviewQueueStatus(status)) {
      continue;
    }
    const chapter = chapterById.get(point.chapter_id);
    items.push({
      id: `learning-point-${point.id}`,
      area: "learning_point",
      title: point.title ?? "Untitled learning point",
      subtitle: chapter
        ? `${chapter.title} — learning point`
        : "Learning point",
      reviewStatus: status,
      href: chapter ? `/admin/chapters/${chapter.slug}` : "/admin/chapters",
    });
  }

  for (const asset of mediaResult.data ?? []) {
    const status = asset.review_status as ReviewStatus;
    incrementCount(counts, status);
    if (!isReviewQueueStatus(status)) {
      continue;
    }
    const chapter = asset.chapter_id
      ? chapterById.get(asset.chapter_id)
      : undefined;
    items.push({
      id: `media-${asset.id}`,
      area: "media",
      title: asset.title ?? "Untitled media asset",
      subtitle: chapter
        ? `Chapter: ${chapter.slug}`
        : "Unassigned media",
      reviewStatus: status,
      href: `/admin/media/${asset.id}`,
    });
  }

  const assessments = assessmentsResult.data ?? [];
  const assessmentById = new Map(
    assessments.map((assessment) => [
      assessment.id,
      {
        title: assessment.title,
        type: assessment.type as "pre" | "post",
      },
    ]),
  );

  for (const assessment of assessments) {
    const status = assessment.review_status as ReviewStatus;
    incrementCount(counts, status);
    if (isReviewQueueStatus(status)) {
      items.push({
        id: `assessment-${assessment.id}`,
        area: "assessment",
        title: assessment.title,
        subtitle:
          assessment.type === "pre" ? "Pre-Assessment" : "Post-Assessment",
        reviewStatus: status,
        href: `/admin/assessments/${assessment.id}`,
      });
    }
  }

  for (const question of questionsResult.data ?? []) {
    const status = question.review_status as ReviewStatus;
    incrementCount(counts, status);
    if (!isReviewQueueStatus(status)) {
      continue;
    }
    const assessment = assessmentById.get(question.assessment_id);
    items.push({
      id: `question-${question.id}`,
      area: "question",
      title: question.prompt,
      subtitle: assessment
        ? `${assessment.title} — question ${question.sort_order}`
        : `Question ${question.sort_order}`,
      reviewStatus: status,
      href: assessment
        ? `/admin/assessments/${question.assessment_id}`
        : "/admin/assessments",
    });
  }

  sortQueueItems(items);
  return { items, counts };
}

/** Mock / offline fallback — parallel chapter loads (still heavier than bulk SQL). */
async function getContentReviewQueueFromDomain(): Promise<ContentReviewQueueSummary> {
  const counts = emptyCounts();
  const items: ContentReviewQueueItem[] = [];

  const chapters = await listChaptersForAdmin();
  const details = await Promise.all(
    chapters.map((chapter) => getChapterForAdmin(chapter.id)),
  );

  chapters.forEach((chapter, index) => {
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

    const detail = details[index];
    if (!detail) {
      return;
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
  });

  const [mediaAssets, assessments] = await Promise.all([
    listMediaAssetsForAdmin({}),
    listAssessmentsForAdmin(),
  ]);

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

  const questionLists = await Promise.all(
    assessments.map((assessment) =>
      getAssessmentQuestionsForAdmin(assessment.id),
    ),
  );

  assessments.forEach((assessment, index) => {
    incrementCount(counts, assessment.reviewStatus);

    if (isReviewQueueStatus(assessment.reviewStatus)) {
      items.push({
        id: `assessment-${assessment.id}`,
        area: "assessment",
        title: assessment.title,
        subtitle:
          assessment.type === "pre" ? "Pre-Assessment" : "Post-Assessment",
        reviewStatus: assessment.reviewStatus,
        href: `/admin/assessments/${assessment.id}`,
      });
    }

    for (const question of questionLists[index] ?? []) {
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
  });

  sortQueueItems(items);
  return { items, counts };
}

export async function getContentReviewQueue(): Promise<ContentReviewQueueSummary> {
  if (hasSupabaseConfig()) {
    return getContentReviewQueueFromSupabase();
  }
  return getContentReviewQueueFromDomain();
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

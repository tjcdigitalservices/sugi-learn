import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminDashboardRepository } from "@/lib/data/types";
import { mapChapterSummary } from "@/lib/data/supabase/mappers/chapter";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type { AdminDashboardSummary } from "@/types/admin-dashboard";
import type { ReviewStatus } from "@/types/review";
import { isPublishedReviewStatus } from "@/types/review";

type ClientFactory = () => Promise<SupabaseClient>;

function countChapters(
  chapters: {
    review_status: ReviewStatus;
    hasPublishedContent: boolean;
  }[],
) {
  return {
    total: chapters.length,
    withPublishedContent: chapters.filter((c) => c.hasPublishedContent).length,
    pendingContent: chapters.filter((c) => !c.hasPublishedContent).length,
    approved: chapters.filter((c) => c.review_status === "approved").length,
    forReview: chapters.filter((c) => c.review_status === "for_review").length,
    draft: chapters.filter((c) => c.review_status === "draft").length,
    needsRevision: chapters.filter((c) => c.review_status === "needs_revision")
      .length,
  };
}

export class SupabaseAdminDashboardRepository implements AdminDashboardRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: chapters, error: chaptersError } = await supabase
      .from("chapters")
      .select("*")
      .order("chapter_number", { ascending: true });

    if (chaptersError) {
      throw new Error("Unable to load dashboard chapter data.");
    }

    const chapterRows = chapters ?? [];
    const chapterIds = chapterRows.map((chapter) => chapter.id);

    const { data: sections, error: sectionsError } = chapterIds.length
      ? await supabase
          .from("chapter_sections")
          .select("chapter_id, review_status")
          .in("chapter_id", chapterIds)
      : { data: [], error: null };

    if (sectionsError) {
      throw new Error("Unable to load dashboard section data.");
    }

    const approvedSectionCounts = new Map<string, number>();
    for (const section of sections ?? []) {
      if (isPublishedReviewStatus(section.review_status)) {
        approvedSectionCounts.set(
          section.chapter_id,
          (approvedSectionCounts.get(section.chapter_id) ?? 0) + 1,
        );
      }
    }

    const chapterList = chapterRows.map((chapter) =>
      mapChapterSummary(chapter, approvedSectionCounts.get(chapter.id) ?? 0),
    );

    const chaptersForCounts = chapterRows.map((chapter) => ({
      review_status: chapter.review_status,
      hasPublishedContent:
        (approvedSectionCounts.get(chapter.id) ?? 0) > 0,
    }));

    const [
      mediaResult,
      assessmentsResult,
      questionsResult,
      learnersResult,
    ] = await Promise.all([
      supabase
        .from("media_assets")
        .select("*", { count: "exact", head: true }),
      supabase.from("assessments").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "learner"),
    ]);

    if (mediaResult.error) {
      throw new Error("Unable to load media counts.");
    }
    if (assessmentsResult.error) {
      throw new Error("Unable to load assessment counts.");
    }
    if (questionsResult.error) {
      throw new Error("Unable to load question counts.");
    }
    if (learnersResult.error) {
      throw new Error("Unable to load learner counts.");
    }

    return {
      chapters: countChapters(chaptersForCounts),
      chapterList,
      mediaAssetCount: mediaResult.count ?? 0,
      assessmentCount: assessmentsResult.count ?? 0,
      questionCount: questionsResult.count ?? 0,
      learnerCount: learnersResult.count ?? 0,
    };
  }
}

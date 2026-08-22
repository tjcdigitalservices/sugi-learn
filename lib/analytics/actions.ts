"use server";

import { requireAdmin } from "@/lib/auth/session";
import {
  buildAssessmentResultsCsv,
  buildChapterCompletionCsv,
  buildLearnerProgressCsv,
} from "@/lib/analytics/csv-export";
import { getAdminAnalyticsSummary } from "@/lib/domain/admin-analytics";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type { AnalyticsFilters } from "@/types/admin-analytics";

export type AnalyticsExportResult =
  | { success: true; filename: string; content: string }
  | { success: false; error: string };

async function exportCsv(
  filters: AnalyticsFilters,
  build: (summary: Awaited<ReturnType<typeof getAdminAnalyticsSummary>>) => string,
  filename: string,
): Promise<AnalyticsExportResult> {
  if (hasSupabaseConfig()) {
    await requireAdmin();
  } else if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Analytics export requires Supabase configuration.",
    };
  }

  try {
    const summary = await getAdminAnalyticsSummary(filters);
    const content = build(summary);
    return { success: true, filename, content };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate export.",
    };
  }
}

export async function exportLearnerProgressCsvAction(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsExportResult> {
  return exportCsv(filters, buildLearnerProgressCsv, "sugidanon-learner-progress.csv");
}

export async function exportAssessmentResultsCsvAction(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsExportResult> {
  return exportCsv(
    filters,
    buildAssessmentResultsCsv,
    "sugidanon-assessment-results.csv",
  );
}

export async function exportChapterCompletionCsvAction(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsExportResult> {
  return exportCsv(
    filters,
    buildChapterCompletionCsv,
    "sugidanon-chapter-completion.csv",
  );
}

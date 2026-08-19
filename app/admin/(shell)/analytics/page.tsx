import { AnalyticsWorkspace } from "@/components/admin/analytics/analytics-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminAnalyticsSummary } from "@/lib/domain/admin-analytics";
import type { AnalyticsFilters } from "@/types/admin-analytics";

interface AdminAnalyticsPageProps {
  searchParams: Promise<{
    assessmentType?: string;
    chapterId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

function parseFilters(
  searchParams: Awaited<AdminAnalyticsPageProps["searchParams"]>,
): AnalyticsFilters {
  const assessmentType =
    searchParams.assessmentType === "pre" ||
    searchParams.assessmentType === "post" ||
    searchParams.assessmentType === "all"
      ? searchParams.assessmentType
      : undefined;

  return {
    assessmentType,
    chapterId: searchParams.chapterId || undefined,
    dateFrom: searchParams.dateFrom || undefined,
    dateTo: searchParams.dateTo || undefined,
  };
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  let summary;
  try {
    summary = await getAdminAnalyticsSummary(filters);
  } catch {
    throw new Error("Unable to load analytics.");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Admin Analytics"
        description="Participation, progress, and assessment metrics from persisted SugiLearn records. Metrics show data only — not research conclusions."
      />
      <AnalyticsWorkspace summary={summary} />
    </div>
  );
}

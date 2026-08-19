import { ChapterOverviewTable } from "@/components/admin/dashboard/chapter-overview-table";
import { ContentStatusSummary } from "@/components/admin/dashboard/content-status-summary";
import { DashboardError } from "@/components/admin/dashboard/dashboard-error";
import { MetricsGrid } from "@/components/admin/dashboard/metrics-grid";
import { ParticipationSummary } from "@/components/admin/dashboard/participation-summary";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { PageHeader } from "@/components/shared/page-header";
import { getParticipationOverview } from "@/lib/domain/admin-analytics";
import { getAdminDashboardSummary } from "@/lib/domain/admin-dashboard";

export default async function AdminDashboardPage() {
  try {
    const [summary, participation] = await Promise.all([
      getAdminDashboardSummary(),
      getParticipationOverview(),
    ]);

    return (
      <div className="space-y-10">
        <PageHeader
          eyebrow="Administration"
          title="Dashboard"
          description="Overview of chapters, content readiness, and system records. All values reflect current database state."
        />

        <MetricsGrid summary={summary} />

        <ParticipationSummary participation={participation} />

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <ContentStatusSummary chapters={summary.chapters} />
          <ChapterOverviewTable chapters={summary.chapterList} />
        </div>

        <RecentActivity />
      </div>
    );
  } catch {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Administration"
          title="Dashboard"
          description="Overview of chapters, content readiness, and system records."
        />
        <DashboardError />
      </div>
    );
  }
}

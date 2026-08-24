import { AssessmentListTable } from "@/components/admin/assessment-management/assessment-list-table";
import { PageHeader } from "@/components/shared/page-header";
import { listAssessmentsForAdmin } from "@/lib/domain/assessment-management";
import type { AdminAssessmentListItem } from "@/types/assessment-management";

export default async function AdminAssessmentsPage() {
  let assessments: AdminAssessmentListItem[] = [];
  let errorMessage: string | null = null;

  try {
    assessments = await listAssessmentsForAdmin();
  } catch {
    errorMessage =
      "Unable to load assessments. Please refresh the page or try again later.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assessment Management"
        description="Manage pre- and post-assessment questions and answers."
      />

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {assessments.length === 0 && !errorMessage ? (
        <div className="space-y-4 rounded-lg border border-dashed px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No assessments found. Seed the official Pre- and Post-Assessment
            question bank (for example{" "}
            <code className="text-xs">npm run db:seed-assessments</code>) before
            managing questions here.
          </p>
        </div>
      ) : (
        <AssessmentListTable assessments={assessments} />
      )}
    </div>
  );
}

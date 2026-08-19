import { AssessmentListTable } from "@/components/admin/assessment-management/assessment-list-table";
import { InitializeAssessmentsButton } from "@/components/admin/assessment-management/initialize-assessments-button";
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
            No assessments found. Initialize the pre- and post-assessment records
            to begin managing questions.
          </p>
          <InitializeAssessmentsButton />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-end gap-3">
            <InitializeAssessmentsButton className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60" />
          </div>
          <AssessmentListTable assessments={assessments} />
        </>
      )}
    </div>
  );
}

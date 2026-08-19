"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye } from "lucide-react";

import { AssessmentMetadataForm } from "@/components/admin/assessment-management/assessment-metadata-form";
import { AssessmentQuestionsPanel } from "@/components/admin/assessment-management/assessment-questions-panel";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import { ASSESSMENT_TYPE_LABELS } from "@/lib/assessment-management/constants";
import type { AssessmentQuestion } from "@/types/assessment";
import type { AdminAssessmentDetail } from "@/types/assessment-management";
import type { ChapterSummary } from "@/types/chapter";

interface AssessmentManagementEditorProps {
  assessment: AdminAssessmentDetail;
  questions: AssessmentQuestion[];
  chapters: ChapterSummary[];
}

export function AssessmentManagementEditor({
  assessment: initialAssessment,
  questions: initialQuestions,
  chapters,
}: AssessmentManagementEditorProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState(initialAssessment);

  function refreshData() {
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {ASSESSMENT_TYPE_LABELS[assessment.type]}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{assessment.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ReviewStatusBadge status={assessment.reviewStatus} />
            <span>{assessment.questionCount} questions</span>
          </div>
        </div>

        <Link
          href={`/admin/assessments/${assessment.id}/preview`}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Preview assessment
        </Link>
      </header>

      <AssessmentMetadataForm assessment={assessment} onSaved={setAssessment} />

      <AssessmentQuestionsPanel
        assessmentId={assessment.id}
        questions={initialQuestions}
        chapters={chapters}
        onChanged={refreshData}
      />
    </div>
  );
}

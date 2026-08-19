import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentEngine } from "@/components/assessment/assessment-engine";
import {
  getAssessmentForAdmin,
  getAssessmentQuestionsForAdmin,
} from "@/lib/domain/assessment-management";

interface AdminAssessmentPreviewPageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function AdminAssessmentPreviewPage({
  params,
}: AdminAssessmentPreviewPageProps) {
  const { assessmentId } = await params;

  let assessment;
  let questions;

  try {
    [assessment, questions] = await Promise.all([
      getAssessmentForAdmin(assessmentId),
      getAssessmentQuestionsForAdmin(assessmentId),
    ]);
  } catch {
    notFound();
  }

  if (!assessment) {
    notFound();
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Admin preview</p>
          <p className="mt-1">
            This assessment has no questions yet. Add questions before previewing.
          </p>
          <Link
            href={`/admin/assessments/${assessmentId}`}
            className="mt-2 inline-block font-medium underline-offset-4 hover:underline"
          >
            Back to assessment editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Admin preview</p>
        <p className="mt-1">
          This preview uses the same AssessmentEngine as the learner experience.
          Correct answers are visible here for authorized admins only.
        </p>
        <Link
          href={`/admin/assessments/${assessmentId}`}
          className="mt-2 inline-block font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to assessment editor
        </Link>
      </div>

      <AssessmentEngine
        assessment={assessment}
        questions={[]}
        previewQuestions={questions}
        mode="preview"
      />
    </div>
  );
}

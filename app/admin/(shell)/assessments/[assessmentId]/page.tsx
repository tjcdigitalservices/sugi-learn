import { notFound } from "next/navigation";

import { AssessmentManagementEditor } from "@/components/admin/assessment-management/assessment-management-editor";
import {
  getAssessmentForAdmin,
  getAssessmentQuestionsForAdmin,
} from "@/lib/domain/assessment-management";
import { listChapterSummaries } from "@/lib/domain/chapters";

interface AdminAssessmentDetailPageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function AdminAssessmentDetailPage({
  params,
}: AdminAssessmentDetailPageProps) {
  const { assessmentId } = await params;

  let assessment;
  let questions;
  let chapters;

  try {
    [assessment, questions, chapters] = await Promise.all([
      getAssessmentForAdmin(assessmentId),
      getAssessmentQuestionsForAdmin(assessmentId),
      listChapterSummaries(),
    ]);
  } catch {
    notFound();
  }

  if (!assessment) {
    notFound();
  }

  return (
    <AssessmentManagementEditor
      assessment={assessment}
      questions={questions}
      chapters={chapters}
    />
  );
}

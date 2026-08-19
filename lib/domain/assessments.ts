import { getRepositories } from "@/lib/data";
import type { Assessment, AssessmentQuestion } from "@/types/assessment";

export async function listAssessments(): Promise<Assessment[]> {
  return getRepositories().assessments.listAssessments();
}

export async function getAssessmentQuestions(
  assessmentId: string,
): Promise<AssessmentQuestion[]> {
  return getRepositories().assessments.getAssessmentQuestions(assessmentId);
}

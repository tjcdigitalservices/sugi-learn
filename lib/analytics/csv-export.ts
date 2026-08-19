import type { AdminAnalyticsSummary } from "@/types/admin-analytics";

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(headers: string[], rows: Array<Array<string | number | null>>): string {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

export function buildLearnerProgressCsv(summary: AdminAnalyticsSummary): string {
  return toCsv(
    [
      "learner",
      "chapters_completed",
      "total_chapters",
      "progress_percentage",
      "current_chapter",
      "pre_assessment_status",
      "post_assessment_status",
    ],
    summary.learners.map((learner) => [
      learner.displayLabel,
      learner.chaptersCompleted,
      learner.totalChapters,
      learner.progressPercentage,
      learner.currentChapterTitle,
      learner.preAssessmentStatus,
      learner.postAssessmentStatus,
    ]),
  );
}

export function buildAssessmentResultsCsv(summary: AdminAnalyticsSummary): string {
  return toCsv(
    ["learner", "assessment", "assessment_type", "score", "completed_at"],
    summary.exportData.assessmentResults.map((row) => [
      row.learnerLabel,
      row.assessmentTitle,
      row.assessmentType,
      row.score,
      row.completedAt,
    ]),
  );
}

export function buildChapterCompletionCsv(summary: AdminAnalyticsSummary): string {
  return toCsv(
    [
      "chapter_number",
      "chapter_title",
      "started_learners",
      "completed_learners",
      "completion_rate",
    ],
    summary.chapters.map((chapter) => [
      chapter.chapterNumber,
      chapter.title,
      chapter.startedLearners,
      chapter.completedLearners,
      chapter.completionRate,
    ]),
  );
}

"use client";

import type { AssessmentQuestion } from "@/types/assessment";
import type { ChapterSummary } from "@/types/chapter";

import { QuestionCreateForm } from "@/components/admin/assessment-management/question-create-form";
import { QuestionEditorCard } from "@/components/admin/assessment-management/question-editor-card";

interface AssessmentQuestionsPanelProps {
  assessmentId: string;
  questions: AssessmentQuestion[];
  chapters: ChapterSummary[];
  onChanged: () => void;
}

export function AssessmentQuestionsPanel({
  assessmentId,
  questions,
  chapters,
  onChanged,
}: AssessmentQuestionsPanelProps) {
  const sortedQuestions = [...questions].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Questions</h2>
        <p className="text-sm text-muted-foreground">
          Manage assessment questions, answer options, and review status.
          Questions follow their numbered order (1, 2, 3…).
        </p>
      </div>

      <QuestionCreateForm assessmentId={assessmentId} onCreated={onChanged} />

      {sortedQuestions.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No questions have been added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((question, index) => (
            <QuestionEditorCard
              key={question.id}
              assessmentId={assessmentId}
              question={question}
              questionIndex={index}
              chapters={chapters}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}

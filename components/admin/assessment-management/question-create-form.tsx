"use client";

import { useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { createQuestionAction } from "@/lib/assessment-management/actions";

interface QuestionCreateFormProps {
  assessmentId: string;
  onCreated: () => void;
}

export function QuestionCreateForm({
  assessmentId,
  onCreated,
}: QuestionCreateFormProps) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createQuestionAction(assessmentId, {
        prompt,
        reviewStatus: "draft",
        options: [
          { label: "[Draft option 1]", sortOrder: 0, isCorrect: true },
          { label: "[Draft option 2]", sortOrder: 1, isCorrect: false },
        ],
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setPrompt("");
      setExpanded(false);
      onCreated();
    });
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={buttonPrimaryClassName}
      >
        Add question
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-dashed bg-muted/10 p-4"
    >
      <div>
        <h3 className="text-sm font-semibold">New question</h3>
        <p className="text-xs text-muted-foreground">
          New questions start as Draft with two empty options. Edit the question
          after creating it.
        </p>
      </div>

      <FormField label="Question text" htmlFor="new-question-prompt">
        <textarea
          id="new-question-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          required
          className={formControlClassName}
        />
      </FormField>

      <FormFeedback error={error} />

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
          {isPending ? "Creating…" : "Create question"}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setPrompt("");
            setError(null);
          }}
          disabled={isPending}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

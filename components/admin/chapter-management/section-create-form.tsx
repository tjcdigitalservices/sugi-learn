"use client";

import { useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { SECTION_KIND_OPTIONS } from "@/lib/chapter-management/constants";
import { createSectionAction } from "@/lib/chapter-management/actions";
import type { ChapterSectionKind } from "@/types/chapter";

interface SectionCreateFormProps {
  chapterId: string;
  onCreated: () => void;
}

export function SectionCreateForm({ chapterId, onCreated }: SectionCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kind, setKind] = useState<ChapterSectionKind>("introduction");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setKind("introduction");
    setTitle("");
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const isTextKind =
      kind === "introduction" ||
      kind === "story" ||
      kind === "cultural_context" ||
      kind === "activity";

    startTransition(async () => {
      const result = await createSectionAction(chapterId, {
        kind,
        title,
        body: isTextKind ? "" : undefined,
        completionMessage: kind === "completion" ? "" : undefined,
        characterIds: kind === "characters" ? [] : undefined,
        learningPointIds: kind === "learning_points" ? [] : undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      resetForm();
      setIsOpen(false);
      onCreated();
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className={buttonPrimaryClassName}
        onClick={() => setIsOpen(true)}
      >
        Add section
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-muted/10 p-4"
    >
      <h3 className="text-sm font-semibold">New section</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Section type" htmlFor="new-section-kind">
          <select
            id="new-section-kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as ChapterSectionKind)
            }
            className={formControlClassName}
          >
            {SECTION_KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.group}: {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Title" htmlFor="new-section-title">
          <input
            id="new-section-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={formControlClassName}
            required
          />
        </FormField>
      </div>

      <FormFeedback error={error} />

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonPrimaryClassName} disabled={isPending}>
          {isPending ? "Adding…" : "Add section"}
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          onClick={() => {
            resetForm();
            setIsOpen(false);
          }}
          disabled={isPending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

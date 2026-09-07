"use client";

import { useEffect, useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { saveCharacterRepresentationNoticeAction } from "@/lib/site-notices/actions";
import type { CharacterRepresentationNoticeCopy } from "@/types/site-notice";

interface CharacterRepresentationNoticeFormProps {
  initialNotice: CharacterRepresentationNoticeCopy;
}

export function CharacterRepresentationNoticeForm({
  initialNotice,
}: CharacterRepresentationNoticeFormProps) {
  const [title, setTitle] = useState(initialNotice.title);
  const [body, setBody] = useState(initialNotice.body);
  const [shortText, setShortText] = useState(initialNotice.shortText);
  const [saved, setSaved] = useState(initialNotice);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    title !== saved.title ||
    body !== saved.body ||
    shortText !== saved.shortText;

  useEffect(() => {
    setTitle(initialNotice.title);
    setBody(initialNotice.body);
    setShortText(initialNotice.shortText);
    setSaved(initialNotice);
  }, [initialNotice]);

  function handleReset() {
    setTitle(saved.title);
    setBody(saved.body);
    setShortText(saved.shortText);
    setError(null);
    setSuccess(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveCharacterRepresentationNoticeAction({
        title,
        body,
        shortText,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(result.notice);
      setTitle(result.notice.title);
      setBody(result.notice.body);
      setShortText(result.notice.shortText);
      setSuccess("Notice saved. Learners will see the updated copy.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Title"
        htmlFor="character-representation-title"
        hint="Shown above the full notice on the chapters page."
      >
        <input
          id="character-representation-title"
          className={formControlClassName}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Full notice"
        htmlFor="character-representation-body"
        hint="Always visible on the learner chapters page."
      >
        <textarea
          id="character-representation-body"
          className={`${formControlClassName} min-h-[140px]`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={2000}
          required
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Short text (open book)"
        htmlFor="character-representation-short"
        hint="Compact line shown inside the open storybook spread."
      >
        <textarea
          id="character-representation-short"
          className={`${formControlClassName} min-h-[72px]`}
          value={shortText}
          onChange={(event) => setShortText(event.target.value)}
          maxLength={240}
          required
          disabled={isPending}
        />
      </FormField>

      <FormFeedback error={error} success={success} />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={buttonPrimaryClassName}
          disabled={isPending || !isDirty}
        >
          {isPending ? "Saving…" : "Save notice"}
        </button>
        <button
          type="button"
          className={buttonSecondaryClassName}
          onClick={handleReset}
          disabled={isPending || !isDirty}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { saveFedericoCaballeroAboutAction } from "@/lib/site-notices/actions";
import type { CharacterRepresentationNoticeCopy } from "@/types/site-notice";

interface FedericoCaballeroAboutFormProps {
  initialNotice: CharacterRepresentationNoticeCopy;
}

export function FedericoCaballeroAboutForm({
  initialNotice,
}: FedericoCaballeroAboutFormProps) {
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
      const result = await saveFedericoCaballeroAboutAction({
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
      setSuccess("Biography saved. The About page will show the updated copy.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Title"
        htmlFor="federico-caballero-title"
        hint="Section heading on the home page."
      >
        <input
          id="federico-caballero-title"
          className={formControlClassName}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Biography"
        htmlFor="federico-caballero-body"
        hint="Separate paragraphs with a blank line. Keep approved wording — do not invent biographical details."
      >
        <textarea
          id="federico-caballero-body"
          className={`${formControlClassName} min-h-[280px]`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={10000}
          required
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Short label"
        htmlFor="federico-caballero-short"
        hint="Compact line shown above the heading."
      >
        <input
          id="federico-caballero-short"
          className={formControlClassName}
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
          {isPending ? "Saving…" : "Save about section"}
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

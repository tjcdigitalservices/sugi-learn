"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";

import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { createChapterAction } from "@/lib/chapter-management/actions";

export function CreateChapterPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setSubtitle("");
    setSummary("");
    setError(null);
  }

  function handleCancel() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createChapterAction({
      title,
      subtitle: subtitle.trim() || null,
      summary: summary.trim() || null,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/admin/chapters/${result.data.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonPrimaryClassName} shrink-0`}
        aria-expanded={false}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add chapter
      </button>
    );
  }

  return (
    <div className="w-full basis-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-[color:rgba(44,36,22,0.1)] bg-white p-5 shadow-sm"
      >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-sl-navy">
            Add chapter
          </h2>
          <p className="mt-1 text-sm text-sl-ink-muted">
            Create a new story chapter. It starts as draft and appears at the
            end of the journey until you reorder or publish content.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className={`${buttonSecondaryClassName} gap-2`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </button>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-sl-ink">Title</span>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus-visible:border-[var(--sl-gold)] focus-visible:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]"
          placeholder="Chapter title"
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-sl-ink">Subtitle (optional)</span>
        <input
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          className="w-full rounded-xl border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus-visible:border-[var(--sl-gold)] focus-visible:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]"
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-sl-ink">Summary (optional)</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          className="w-full resize-y rounded-xl border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus-visible:border-[var(--sl-gold)] focus-visible:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]"
        />
      </label>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonPrimaryClassName}
      >
        {isSubmitting ? "Creating…" : "Create chapter"}
      </button>
    </form>
    </div>
  );
}

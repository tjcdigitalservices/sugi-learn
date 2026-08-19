"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SectionEmptyState } from "@/components/chapter/sections/section-empty-state";
import { completeChapterAction } from "@/lib/progress/actions";
import type { CompletionSection } from "@/types/chapter";

interface CompletionSectionViewProps {
  section: CompletionSection;
  chapterId: string;
  chapterTitle: string;
  interactive?: boolean;
  initiallyCompleted?: boolean;
  nextChapterId?: string | null;
}

export function CompletionSectionView({
  section,
  chapterId,
  chapterTitle,
  interactive = false,
  initiallyCompleted = false,
  nextChapterId,
}: CompletionSectionViewProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    setError(null);

    startTransition(async () => {
      const result = await completeChapterAction(chapterId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setCompleted(true);
      router.refresh();
    });
  }

  return (
    <article className="space-y-4 rounded-lg border bg-muted/20 p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {section.title}
      </h2>

      {section.message ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          {section.message}
        </p>
      ) : (
        <SectionEmptyState message="Completion message is not available yet." />
      )}

      {interactive ? (
        <div className="space-y-3 pt-2">
          {completed ? (
            <div className="space-y-3" role="status">
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Chapter complete. Your progress has been saved.
              </p>
              <div className="flex flex-wrap gap-3">
                {nextChapterId ? (
                  <Link
                    href={`/learn/chapters/${nextChapterId}`}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Continue to next chapter
                  </Link>
                ) : null}
                <Link
                  href="/learn"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Return to home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                onClick={handleComplete}
                disabled={isPending}
              >
                {isPending ? "Saving…" : "I've finished this chapter"}
              </button>
            </>
          )}
        </div>
      ) : null}

      {!interactive && completed ? (
        <p className="text-sm text-muted-foreground">
          {chapterTitle} — completed
        </p>
      ) : null}
    </article>
  );
}

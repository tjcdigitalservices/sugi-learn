"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { completeChapterAction } from "@/lib/progress/actions";

interface CompleteChapterButtonProps {
  chapterId: string;
  completed: boolean;
}

export function CompleteChapterButton({
  chapterId,
  completed: initiallyCompleted,
}: CompleteChapterButtonProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (completed) {
    return (
      <p
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        Chapter complete. Your progress has been saved.
      </p>
    );
  }

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
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleComplete}
        disabled={isPending}
        className="sl-btn-gold"
      >
        {isPending ? "Saving…" : "I've finished this chapter"}
      </button>
    </div>
  );
}

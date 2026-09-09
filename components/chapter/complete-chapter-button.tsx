"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";

import { BusyButton } from "@/components/shared/busy-button";
import { completeChapterAction } from "@/lib/progress/actions";

interface CompleteChapterButtonProps {
  chapterId: string;
  completed: boolean;
  /** When true, show unlock helper while incomplete. */
  hasNextChapter?: boolean;
}

export function CompleteChapterButton({
  chapterId,
  completed: initiallyCompleted,
  hasNextChapter = false,
}: CompleteChapterButtonProps) {
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

  if (completed) {
    return (
      <p
        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900"
        role="status"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-semibold">Chapter completed.</span> Your
          progress has been saved.
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {hasNextChapter ? (
        <p
          className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3.5 text-sm text-amber-950"
          role="status"
        >
          <Lock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Complete this chapter to unlock the next chapter.</span>
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <BusyButton
        busy={isPending}
        busyLabel="Saving…"
        onClick={handleComplete}
        className="sl-btn-gold"
      >
        I&apos;ve finished this chapter
      </BusyButton>
    </div>
  );
}

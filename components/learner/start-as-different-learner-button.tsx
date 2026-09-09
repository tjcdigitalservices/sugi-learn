"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { startFreshGuestSession } from "@/lib/auth/guest-session";

export function StartAsDifferentLearnerButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setError(null);
    setIsLoading(true);

    try {
      const result = await startFreshGuestSession();
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      router.push("/learn/onboarding");
      router.refresh();
      // Keep loading until navigation unmounts this button.
    } catch {
      setError("Unable to start a new session. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sl-ink-muted underline-offset-4 transition hover:text-sl-navy hover:underline disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : null}
        {isLoading ? "Starting new session…" : "Start as a different learner"}
      </button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

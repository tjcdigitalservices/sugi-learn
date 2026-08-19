"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        return;
      }
      router.push("/learn/onboarding");
      router.refresh();
    } catch {
      setError("Unable to start a new session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="text-sm font-medium text-sl-ink-muted underline-offset-4 transition hover:text-sl-navy hover:underline disabled:opacity-60"
      >
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

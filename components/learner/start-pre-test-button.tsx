"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";

import { startFreshGuestSession } from "@/lib/auth/guest-session";
import { cn } from "@/lib/utils";

interface StartPreTestButtonProps {
  className?: string;
  label?: string;
  showIcons?: boolean;
}

export function StartPreTestButton({
  className,
  label = "Start Your Pre-Test",
  showIcons = true,
}: StartPreTestButtonProps) {
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
      setError("Unable to start right now. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        className={cn(
          "sl-btn-gold disabled:cursor-wait",
          isLoading && "cursor-wait",
          className,
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : showIcons ? (
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        ) : null}
        {isLoading ? "Starting…" : label}
        {!isLoading && showIcons ? (
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        ) : null}
      </button>
      {error ? (
        <p className="max-w-md text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

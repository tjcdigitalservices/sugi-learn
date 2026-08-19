"use client";

import Link from "next/link";
import { useEffect } from "react";

import { logClientError } from "@/lib/logging/log-client-error";

interface ChapterErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ChapterError({ error, reset }: ChapterErrorProps) {
  useEffect(() => {
    logClientError(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Unable to load chapter</h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while loading this chapter. Please try again.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
        <Link
          href="/learn/chapters"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All chapters
        </Link>
      </div>
    </div>
  );
}

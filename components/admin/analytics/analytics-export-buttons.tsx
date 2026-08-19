"use client";

import { useState, useTransition } from "react";

import type { AnalyticsExportResult } from "@/lib/analytics/actions";
import type { AnalyticsFilters } from "@/types/admin-analytics";

interface AnalyticsExportButtonsProps {
  filters: AnalyticsFilters;
  exportLearnerProgress: (
    filters: AnalyticsFilters,
  ) => Promise<AnalyticsExportResult>;
  exportAssessmentResults: (
    filters: AnalyticsFilters,
  ) => Promise<AnalyticsExportResult>;
  exportChapterCompletion: (
    filters: AnalyticsFilters,
  ) => Promise<AnalyticsExportResult>;
}

function downloadCsv(result: AnalyticsExportResult) {
  if (!result.success) {
    return result.error;
  }

  const blob = new Blob([result.content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = result.filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return null;
}

export function AnalyticsExportButtons({
  filters,
  exportLearnerProgress,
  exportAssessmentResults,
  exportChapterCompletion,
}: AnalyticsExportButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport(
    action: (filters: AnalyticsFilters) => Promise<AnalyticsExportResult>,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action(filters);
      const message = downloadCsv(result);
      if (message) {
        setError(message);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleExport(exportLearnerProgress)}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Export learner progress CSV
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleExport(exportAssessmentResults)}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Export assessment results CSV
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleExport(exportChapterCompletion)}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Export chapter completion CSV
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

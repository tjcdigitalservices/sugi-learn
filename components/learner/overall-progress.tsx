interface OverallProgressProps {
  completedCount: number;
  totalChapters: number;
  inProgressCount?: number;
}

export function OverallProgress({
  completedCount,
  totalChapters,
  inProgressCount = 0,
}: OverallProgressProps) {
  const percentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Overall progress</p>
          <p className="text-2xl font-semibold tabular-nums">
            {completedCount} of {totalChapters} chapters completed
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{percentage}%</p>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={totalChapters}
        aria-label={`${completedCount} of ${totalChapters} chapters completed`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {inProgressCount > 0 ? (
        <p className="text-sm text-muted-foreground">
          {inProgressCount} chapter{inProgressCount === 1 ? "" : "s"} in progress
        </p>
      ) : null}
    </div>
  );
}

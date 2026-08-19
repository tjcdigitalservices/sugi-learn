import { cn } from "@/lib/utils";
import type { ChapterProgressStatus } from "@/types/progress";

const STATUS_CONFIG: Record<
  ChapterProgressStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: "Not started",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In progress",
    className: "bg-sky-100 text-sky-900",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-900",
  },
};

interface ProgressStatusBadgeProps {
  status: ChapterProgressStatus;
  className?: string;
}

export function ProgressStatusBadge({
  status,
  className,
}: ProgressStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

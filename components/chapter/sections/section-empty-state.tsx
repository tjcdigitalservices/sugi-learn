import { cn } from "@/lib/utils";

interface SectionEmptyStateProps {
  message: string;
  className?: string;
}

export function SectionEmptyState({
  message,
  className,
}: SectionEmptyStateProps) {
  return (
    <p
      className={cn(
        "rounded-md border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
      role="status"
    >
      {message}
    </p>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";

interface PlaceholderPanelProps {
  title: string;
  description: string;
  milestone?: string;
  actions?: { href: string; label: string }[];
  className?: string;
}

export function PlaceholderPanel({
  title,
  description,
  milestone,
  actions,
  className,
}: PlaceholderPanelProps) {
  return (
    <section
      className={cn(
        "mx-auto max-w-2xl space-y-4 rounded-lg border bg-card p-8 text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="space-y-2">
        {milestone ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {milestone}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && actions.length > 0 ? (
        <div className="flex flex-wrap gap-3 pt-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

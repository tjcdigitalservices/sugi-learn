import Link from "next/link";

interface AssessmentAccessBlockedStateProps {
  title: string;
  description: string;
}

export function AssessmentAccessBlockedState({
  title,
  description,
}: AssessmentAccessBlockedStateProps) {
  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href="/learn/chapters"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View chapters
        </Link>
        <Link
          href="/learn"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

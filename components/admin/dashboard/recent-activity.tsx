import { Clock3 } from "lucide-react";

export function RecentActivity() {
  return (
    <section aria-labelledby="recent-activity-heading" className="space-y-4">
      <div>
        <h2
          id="recent-activity-heading"
          className="font-display text-xl font-semibold text-sl-navy"
        >
          Recent activity
        </h2>
        <p className="text-sm text-sl-ink-muted">
          Editorial and review events will appear here as workflows expand.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:rgba(44,36,22,0.15)] bg-white/60 px-6 py-12 text-center">
        <Clock3
          className="mb-3 h-8 w-8 text-sl-ink-muted"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-sl-navy">No recent activity yet.</p>
        <p className="mt-1 max-w-md text-sm text-sl-ink-muted">
          Once content editing and review workflows are live, updates will be
          listed here.
        </p>
      </div>
    </section>
  );
}

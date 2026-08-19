import { AlertTriangle } from "lucide-react";

export function DashboardError() {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-8">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
          <p className="text-sm text-muted-foreground">
            The dashboard could not retrieve current system data. Please refresh
            the page or try again later. If the problem continues, contact your
            system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

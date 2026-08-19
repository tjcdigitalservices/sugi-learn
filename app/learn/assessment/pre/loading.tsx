export default function PreAssessmentLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6 rounded-lg border bg-card p-8">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="h-8 w-3/4 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-16 rounded bg-muted" />
        <div className="h-16 rounded bg-muted" />
        <div className="h-16 rounded bg-muted" />
      </div>
      <div className="flex justify-between">
        <div className="h-10 w-24 rounded bg-muted" />
        <div className="h-10 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

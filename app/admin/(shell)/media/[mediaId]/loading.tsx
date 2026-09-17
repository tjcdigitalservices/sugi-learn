export default function AdminMediaDetailLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-7 w-48 animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="aspect-video w-full animate-pulse rounded-lg border bg-muted/40" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md border bg-muted/40" />
            <div className="h-10 animate-pulse rounded-md border bg-muted/40" />
          </div>
          <div className="h-24 animate-pulse rounded-md border bg-muted/40" />
          <div className="h-10 animate-pulse rounded-md border bg-muted/40" />
          <div className="flex gap-3">
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <aside className="space-y-4 rounded-lg border bg-muted/10 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

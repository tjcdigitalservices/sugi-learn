import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          Your account does not have administrator access. If you believe this is
          an error, contact a project administrator.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/learn"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go to learner area
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-md border px-4 py-2 text-sm font-medium"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

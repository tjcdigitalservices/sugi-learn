import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sl-cream px-4 py-12 font-body text-sl-ink">
      <Suspense
        fallback={
          <div className="text-sm text-sl-ink-muted">Loading sign-in…</div>
        }
      >
        <LoginForm
          title="Administrator sign-in"
          description="Sign in with your administrator email and password to manage content and view analytics. Learners start from the home page — no account needed."
        />
      </Suspense>
    </main>
  );
}

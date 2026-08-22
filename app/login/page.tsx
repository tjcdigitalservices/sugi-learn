import { Suspense } from "react";

import { HeritageAuthShell } from "@/components/auth/heritage-auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <HeritageAuthShell>
      <Suspense
        fallback={
          <p className="text-center text-sm text-white/80 lg:text-sl-ink-muted">
            Loading sign-in…
          </p>
        }
      >
        <LoginForm
          title="Welcome to Sugidanon"
          description="Continue your learning journey through the Sugidanon Epic Story. Administrator sign-in."
        />
      </Suspense>
    </HeritageAuthShell>
  );
}

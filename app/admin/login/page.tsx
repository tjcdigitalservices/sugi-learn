import { Suspense } from "react";

import { HeritageAuthShell } from "@/components/auth/heritage-auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <HeritageAuthShell layout="interactionLeft">
      <Suspense
        fallback={
          <p className="text-center text-sm text-white/80 lg:text-sl-ink-muted">
            Loading admin sign-in…
          </p>
        }
      >
        <LoginForm variant="admin" />
      </Suspense>
    </HeritageAuthShell>
  );
}

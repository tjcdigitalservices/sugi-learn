import { Suspense } from "react";

import { HeritageAuthShell } from "@/components/auth/heritage-auth-shell";
import { LoginForm } from "@/components/auth/login-form";

/** PANEL-A01 — Learner sign-in (docs/PANEL_UI_CODE_MAP.md) */
export default function LoginPage() {
  return (
    <HeritageAuthShell layout="interactionLeft">
      <Suspense
        fallback={
          <p className="text-center text-sm text-white/80 lg:text-sl-ink-muted">
            Loading sign-in…
          </p>
        }
      >
        <LoginForm variant="learner" />
      </Suspense>
    </HeritageAuthShell>
  );
}

import { Suspense } from "react";

import { HeritageAuthShell } from "@/components/auth/heritage-auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <HeritageAuthShell layout="interactionLeft">
      <Suspense
        fallback={
          <p className="text-center text-sm text-white/80 lg:text-sl-ink-muted">
            Loading…
          </p>
        }
      >
        <RegisterForm />
      </Suspense>
    </HeritageAuthShell>
  );
}

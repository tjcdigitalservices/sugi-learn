"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock, User } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
import { saveLearnerNameAction } from "@/lib/learner/onboarding-actions";

export function LearnerOnboardingForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveLearnerNameAction({ firstName, lastName });
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="sl-card relative mx-auto w-full max-w-lg">
      <div className="relative space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sl-gold">
            Step 1 of 2
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[color:rgba(44,36,22,0.1)]">
            <div className="h-full w-1/2 rounded-full bg-sl-gold" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-sl-navy">
            Let&apos;s get to know you
          </h1>
          <p className="text-sm leading-relaxed text-sl-ink-muted">
            Enter your name to begin the assessment. Your name will appear on
            your results and report.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-sl-ink">First Name *</span>
            <span className="flex items-center gap-3 rounded-xl border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
              <User
                className="h-4 w-4 shrink-0 text-sl-ink-muted"
                aria-hidden="true"
              />
              <input
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
                autoComplete="given-name"
                disabled={isPending}
                placeholder="Maria"
              />
            </span>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-sl-ink">Last Name *</span>
            <span className="flex items-center gap-3 rounded-xl border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
              <User
                className="h-4 w-4 shrink-0 text-sl-ink-muted"
                aria-hidden="true"
              />
              <input
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
                autoComplete="family-name"
                disabled={isPending}
                placeholder="Santos"
              />
            </span>
          </label>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <button type="submit" className="sl-btn-gold w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Continue to Pre-Test"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <p className="flex items-center justify-center gap-2 text-xs text-sl-ink-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Your information is kept private and secure.
        </p>
      </div>

      <HeritageWave className="h-14" />
    </div>
  );
}

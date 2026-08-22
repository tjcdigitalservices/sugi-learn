"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock, User } from "lucide-react";

import { HeritageAuthCard } from "@/components/auth/heritage-auth-shell";
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
    <HeritageAuthCard>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sl-gold-soft">
          Step 1 of 2
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-1/2 rounded-full bg-sl-gold" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
          Let&apos;s get to know you
        </h1>
        <p className="text-sm leading-relaxed text-white/85">
          Enter your name to begin the assessment. Your name will appear on your
          results and report.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1.5 text-sm" htmlFor="firstName">
          <span className="font-medium text-white">First Name *</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <User
              className="h-4 w-4 shrink-0 text-sl-ink-muted"
              aria-hidden="true"
            />
            <input
              id="firstName"
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

        <label className="block space-y-1.5 text-sm" htmlFor="lastName">
          <span className="font-medium text-white">Last Name *</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <User
              className="h-4 w-4 shrink-0 text-sl-ink-muted"
              aria-hidden="true"
            />
            <input
              id="lastName"
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
            className="rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm text-white"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="sl-btn-gold w-full py-3.5 text-sm font-semibold shadow-md"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Continue to Pre-Test"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-white/80">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Your information is kept private and secure.
      </p>
    </HeritageAuthCard>
  );
}

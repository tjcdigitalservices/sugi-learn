"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";

import { HeritageAuthCard } from "@/components/auth/heritage-auth-shell";
import { BusyButton } from "@/components/shared/busy-button";
import {
  createLearnerAccountAction,
  upgradeGuestAccountAction,
} from "@/lib/auth/register-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 6;

function mapClientAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("already") || lower.includes("registered")) {
    return "That email is already registered. Sign in instead.";
  }
  if (lower.includes("rate limit")) {
    return "Too many email attempts. Wait a few minutes, then try again or sign in.";
  }
  if (lower.includes("same password") || lower.includes("different from the old")) {
    return "That password was already used in a partial signup. Try a different password, or sign in if the account exists.";
  }

  return message || "Unable to create your account. Please try again.";
}

function splitDisplayName(displayName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = displayName?.trim() ?? "";
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prefillGuestName() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) {
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled || !profile?.display_name) {
          return;
        }

        const split = splitDisplayName(profile.display_name);
        setFirstName((current) => current || split.firstName);
        setLastName((current) => current || split.lastName);
      } catch {
        // Prefill is optional.
      }
    }

    void prefillGuestName();
    return () => {
      cancelled = true;
    };
  }, []);

  function goToLearning() {
    window.location.assign("/learn/continue");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedFirst || !trimmedLast) {
      setError("First name and last name are required.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const namePayload = {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: trimmedEmail,
      password,
    };
    const displayName = `${trimmedFirst} ${trimmedLast}`.replace(/\s+/g, " ").trim();

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.is_anonymous) {
        const upgrade = await upgradeGuestAccountAction(namePayload);

        if (!upgrade.success) {
          setError(upgrade.error);
          setIsLoading(false);
          return;
        }

        await supabase.auth.signOut({ scope: "local" });
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (signInError) {
          setError(
            "Account was saved, but sign-in failed. Try Sign in with the same email and password.",
          );
          setIsLoading(false);
          return;
        }

        goToLearning();
        return;
      }

      if (user && !user.is_anonymous) {
        const { error: nameError } = await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", user.id);

        if (nameError) {
          setError("Unable to save your name. Please try again.");
          setIsLoading(false);
          return;
        }

        goToLearning();
        return;
      }

      const created = await createLearnerAccountAction(namePayload);

      if (!created.success) {
        setError(created.error);
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError(
          mapClientAuthError(
            "Account was saved, but sign-in failed. Try Sign in with the same email and password.",
          ),
        );
        setIsLoading(false);
        return;
      }

      goToLearning();
    } catch {
      setError("Unable to create your account right now. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <HeritageAuthCard>
      <div className="auth-entrance-item auth-d1 space-y-2 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
          Save your progress
        </h1>
        <p className="text-sm leading-relaxed text-white/85">
          Create an account with your name so you can return later and continue
          chapters without retaking the Pre-Test.
        </p>
      </div>

      <div
        className="auth-entrance-item auth-d2 flex items-center gap-3"
        aria-hidden="true"
      >
        <div className="h-px flex-1 bg-white/30" />
        <div className="h-2 w-2 rotate-45 bg-sl-gold" />
        <div className="h-px flex-1 bg-white/30" />
      </div>

      <form className="auth-entrance-item auth-d3 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm" htmlFor="register-first-name">
            <span className="font-medium text-white">First name</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
              <input
                id="register-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                maxLength={80}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
                placeholder="Maria"
                disabled={isLoading}
              />
              <User
                className="h-4 w-4 shrink-0 text-sl-ink-muted"
                aria-hidden="true"
              />
            </span>
          </label>

          <label className="block space-y-1.5 text-sm" htmlFor="register-last-name">
            <span className="font-medium text-white">Last name</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
              <input
                id="register-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                maxLength={80}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
                placeholder="Santos"
                disabled={isLoading}
              />
              <User
                className="h-4 w-4 shrink-0 text-sl-ink-muted"
                aria-hidden="true"
              />
            </span>
          </label>
        </div>

        <label className="block space-y-1.5 text-sm" htmlFor="register-email">
          <span className="font-medium text-white">Email</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
              placeholder="you@school.edu"
              disabled={isLoading}
            />
            <User
              className="h-4 w-4 shrink-0 text-sl-ink-muted"
              aria-hidden="true"
            />
          </span>
        </label>

        <label className="block space-y-1.5 text-sm" htmlFor="register-password">
          <span className="font-medium text-white">Password</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="shrink-0 text-sl-ink-muted transition hover:text-sl-navy"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </span>
        </label>

        <label
          className="block space-y-1.5 text-sm"
          htmlFor="register-confirm-password"
        >
          <span className="font-medium text-white">Confirm password</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
              placeholder="Re-enter password"
              disabled={isLoading}
            />
            <Lock
              className="h-4 w-4 shrink-0 text-sl-ink-muted"
              aria-hidden="true"
            />
          </span>
        </label>

        {error ? (
          <p
            className="rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm text-white"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <BusyButton
          type="submit"
          busy={isLoading}
          busyLabel="Creating account…"
          trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          className="sl-btn-gold w-full rounded-xl py-3.5 text-sm font-semibold shadow-md"
        >
          Create account
        </BusyButton>
      </form>

      <p className="auth-entrance-item auth-d4 text-center text-xs text-white/80">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-sl-gold-soft underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      <p className="auth-entrance-item auth-d5 text-center text-xs text-white/75">
        Prefer to keep exploring first?{" "}
        <Link
          href="/learn"
          className="font-medium text-sl-gold-soft underline underline-offset-4"
        >
          Back to learning
        </Link>
      </p>
    </HeritageAuthCard>
  );
}

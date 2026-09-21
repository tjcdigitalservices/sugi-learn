"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, User } from "lucide-react";

import { HeritageAuthCard } from "@/components/auth/heritage-auth-shell";
import { BusyButton } from "@/components/shared/busy-button";
import {
  defaultPostLoginPath,
  resolvePostLoginPath,
} from "@/lib/auth/post-login";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

interface LoginFormProps {
  title?: string;
  description?: string;
}

function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Unable to sign in right now. Please try again.";
}

export function LoginForm({
  title = "Welcome back",
  description = "Sign in to continue your Suguidanon journey. Administrators can also sign in here.",
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const requestedNext = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const normalizedEmail = email.trim().toLowerCase();

      // Clear guest session before signing into a permanent account.
      // Ignore sign-out failures — they must not block a valid password login.
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // continue
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email: normalizedEmail,
          password,
        },
      );

      if (signInError || !data.user) {
        setError(
          "Invalid email or password. If you registered as a guest, use Create account again, or continue as a guest and save your progress.",
        );
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        // Session is valid — still enter the app; profile can be healed later.
        console.warn("Login profile lookup failed:", profileError.message);
      }

      const role = (profile?.role ?? "learner") as UserRole;
      const displayName = profile?.display_name ?? null;

      let destination: string;
      if (role === "admin") {
        destination = requestedNext
          ? resolvePostLoginPath(role, requestedNext, displayName)
          : defaultPostLoginPath(role, displayName);
      } else if (requestedNext?.startsWith("/learn")) {
        destination = resolvePostLoginPath(role, requestedNext, displayName);
      } else {
        // Resume onboarding / pre-test / home from saved progress.
        destination = "/learn/continue";
      }

      // Full navigation so session cookies are applied before /learn renders.
      window.location.assign(destination);
    } catch (err) {
      console.error("Login failed:", err);
      setError(errorMessage(err));
      setIsLoading(false);
    }
  }

  return (
    <HeritageAuthCard>
      <div className="auth-entrance-item auth-d1 space-y-2 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-white/85">{description}</p>
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
        <label className="block space-y-1.5 text-sm" htmlFor="email">
          <span className="font-medium text-white">Email</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
              placeholder="Enter your email"
              disabled={isLoading}
            />
            <User
              className="h-4 w-4 shrink-0 text-sl-ink-muted"
              aria-hidden="true"
            />
          </span>
        </label>

        <label className="block space-y-1.5 text-sm" htmlFor="password">
          <span className="font-medium text-white">Password</span>
          <span className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 px-4 py-3 shadow-sm transition focus-within:border-sl-gold focus-within:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sl-ink outline-none placeholder:text-sl-ink-muted/70"
              placeholder="Enter your password"
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
          busyLabel="Signing in…"
          trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          className="sl-btn-gold w-full rounded-xl py-3.5 text-sm font-semibold shadow-md"
        >
          Sign In
        </BusyButton>
      </form>

      <p className="auth-entrance-item auth-d4 text-center text-xs text-white/75">
        <span className="opacity-80">Forgot password?</span>{" "}
        <span className="font-medium opacity-70">Coming soon</span>
      </p>

      <p className="auth-entrance-item auth-d5 text-center text-xs text-white/80">
        New learner?{" "}
        <Link
          href="/"
          className="font-medium text-sl-gold-soft underline underline-offset-4"
        >
          Start as guest
        </Link>
        {" · "}
        <Link
          href="/register"
          className="font-medium text-sl-gold-soft underline underline-offset-4"
        >
          Create account
        </Link>
      </p>
    </HeritageAuthCard>
  );
}

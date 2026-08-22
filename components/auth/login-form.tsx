"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";

import { HeritageAuthCard } from "@/components/auth/heritage-auth-shell";
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

export function LoginForm({
  title = "Welcome to Sugidanon",
  description = "Continue your learning journey through the Sugidanon Epic Story. Administrator sign-in.",
}: LoginFormProps) {
  const router = useRouter();
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

      if (signInError || !data.user) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = (profile?.role ?? "learner") as UserRole;

      if (role !== "admin") {
        await supabase.auth.signOut({ scope: "local" });
        setError(
          "This form is for administrators only. Learners can start from the home page without an account.",
        );
        return;
      }

      const displayName = profile?.display_name ?? null;
      const destination = requestedNext
        ? resolvePostLoginPath(role, requestedNext, displayName)
        : defaultPostLoginPath(role, displayName);

      router.push(destination);
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <HeritageAuthCard>
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-white/85">{description}</p>
      </div>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-white/30" />
        <div className="h-2 w-2 rotate-45 bg-sl-gold" />
        <div className="h-px flex-1 bg-white/30" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <button
          type="submit"
          disabled={isLoading}
          className="sl-btn-gold w-full rounded-xl py-3.5 text-sm font-semibold shadow-md"
        >
          {isLoading ? "Signing in…" : "Sign In"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <p className="text-center text-xs text-white/75">
        <span className="opacity-80">Forgot password?</span>{" "}
        <span className="font-medium opacity-70">Coming soon</span>
      </p>

      <p className="flex items-start justify-center gap-2 text-center text-xs text-white/80">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Administrator accounts are provisioned by the project owner. Learners
          start from the home page.{" "}
          <Link
            href="/"
            className="font-medium text-sl-gold-soft underline underline-offset-4"
          >
            Back to home
          </Link>
        </span>
      </p>
    </HeritageAuthCard>
  );
}

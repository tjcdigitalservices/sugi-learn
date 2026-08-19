"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
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
  title = "Administrator sign-in",
  description = "Use your administrator email and password.",
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="sl-card relative mx-auto w-full max-w-md">
      <div className="relative space-y-6 px-6 py-8 sm:px-8">
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sl-gold">
            Administrator
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-sl-navy">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-sl-ink-muted">{description}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5 text-sm" htmlFor="email">
            <span className="font-medium text-sl-ink">Email</span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="sl-input"
              placeholder="admin@sugilearn.com"
              disabled={isLoading}
            />
          </label>

          <label className="block space-y-1.5 text-sm" htmlFor="password">
            <span className="font-medium text-sl-ink">Password</span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="sl-input"
              disabled={isLoading}
            />
          </label>

          {error ? (
            <p
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isLoading} className="sl-btn-gold w-full">
            {isLoading ? "Signing in…" : "Sign in"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <p className="flex items-start justify-center gap-2 text-center text-xs text-sl-ink-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Administrator accounts are provisioned by the project owner. Learners
            start from the home page with name only.{" "}
            <Link
              href="/"
              className="font-medium text-sl-navy underline underline-offset-4"
            >
              Back to home
            </Link>
          </span>
        </p>
      </div>

      <HeritageWave className="h-14" />
    </div>
  );
}

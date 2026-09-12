import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { HeritageWave, SuguidanonMark } from "@/components/brand/heritage-wave";
import { cn } from "@/lib/utils";

import "./heritage-auth-entrance.css";

interface HeritageAuthShellProps {
  children: React.ReactNode;
  className?: string;
  /**
   * centered — unused reserved default.
   * interactionLeft — form at ~26–28% vw so story art reads on the right (onboarding + admin login).
   */
  layout?: "centered" | "interactionLeft";
}

/**
 * Full-bleed transparent auth layout (admin login + learner onboarding).
 * Brand + form stack on the hero photo — no frosted panel.
 * Photo orientation is unchanged.
 */
export function HeritageAuthShell({
  children,
  className,
  layout = "centered",
}: HeritageAuthShellProps) {
  const isInteractionLeft = layout === "interactionLeft";

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col font-body text-sl-ink",
        className,
      )}
    >
      <Image
        src="/images/landing-hero.png"
        alt=""
        fill
        priority
        className="object-cover object-[center_40%]"
        sizes="100vw"
      />
      {/* Existing atmospheric wash — mood unchanged */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[rgba(7,20,40,0.55)] via-[rgba(7,20,40,0.35)] to-[rgba(7,20,40,0.72)]"
        aria-hidden="true"
      />
      {/* Left-only vignette for form readability — soft fade, no panel edge */}
      {isInteractionLeft ? (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[min(100%,42rem)] bg-gradient-to-r from-[rgba(7,20,40,0.45)] via-[rgba(7,20,40,0.22)] to-transparent md:w-[52%] lg:w-[44%]"
          aria-hidden="true"
        />
      ) : null}

      <div className="relative z-10 flex min-h-dvh flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-8 lg:pb-20">
        <div
          className={cn(
            "flex w-full max-w-md flex-1 flex-col justify-center gap-6 sm:gap-8",
            isInteractionLeft
              ? // Mobile: centered. Tablet/desktop: form center ~26–28% vw (half of max-w-md = 14rem).
                "mx-auto md:mx-0 md:ml-[max(1.25rem,calc(26vw-14rem))] lg:ml-[max(1.5rem,calc(28vw-14rem))]"
              : "mx-auto",
          )}
        >
          <div className="auth-entrance__brand flex justify-center">
            <SuguidanonMark
              light
              stacked
              showTagline
              size="xl"
              className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            />
          </div>
          {children}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 lg:hidden">
        <HeritageWave className="h-14 opacity-70" tone="navy" />
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-20 hidden border-t border-white/10 bg-sl-navy-deep px-6 py-3 text-xs text-white/70 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <p className="flex min-w-0 items-start gap-2.5">
            <BookOpen
              className="mt-0.5 h-4 w-4 shrink-0 text-sl-gold-soft"
              aria-hidden="true"
            />
            <span className="leading-relaxed">
              <span className="font-semibold text-sl-gold-soft">
                Learn. Understand. Carry Forward.
              </span>{" "}
              An interactive learning journey through the Suguidanon Epic Story.
            </span>
          </p>
          <nav
            className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1"
            aria-label="Legal"
          >
            <span className="cursor-default text-white/50">Privacy</span>
            <span aria-hidden="true" className="text-white/30">
              |
            </span>
            <span className="cursor-default text-white/50">Terms</span>
            <span aria-hidden="true" className="text-white/30">
              |
            </span>
            <Link href="/" className="text-sl-gold-soft hover:underline">
              Home
            </Link>
            <span aria-hidden="true" className="text-white/30">
              ·
            </span>
            <span className="text-white/50">© 2026 Suguidanon</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Transparent form wrapper — content sits on the heritage photo. */
export function HeritageAuthCard({
  children,
  className,
  showWave = false,
}: {
  children: React.ReactNode;
  className?: string;
  showWave?: boolean;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative space-y-6">{children}</div>
      {showWave ? (
        <HeritageWave className="mt-8 h-12 lg:hidden" tone="gold" />
      ) : null}
    </div>
  );
}

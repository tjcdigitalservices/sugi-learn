import Image from "next/image";

import { cn } from "@/lib/utils";

interface HeritageWaveProps {
  className?: string;
  tone?: "gold" | "cream" | "navy";
}

const TONE_FILL: Record<NonNullable<HeritageWaveProps["tone"]>, string> = {
  gold: "var(--sl-wave)",
  cream: "var(--sl-cream-deep)",
  navy: "var(--sl-navy)",
};

/** Decorative traditional wave motif used on learner heritage cards. */
export function HeritageWave({
  className,
  tone = "gold",
}: HeritageWaveProps) {
  return (
    <svg
      className={cn("pointer-events-none h-16 w-full opacity-40", className)}
      viewBox="0 0 800 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 48c40-18 80-18 120 0s80 18 120 0 80-18 120 0 80 18 120 0 80-18 120 0 80 18 120 0 80-18 120 0v32H0V48Z"
        fill={TONE_FILL[tone]}
      />
      <path
        d="M0 36c40-14 80-14 120 0s80 14 120 0 80-14 120 0 80 14 120 0 80-14 120 0 80 14 120 0 80-14 120 0"
        stroke={TONE_FILL[tone]}
        strokeWidth="2"
        opacity="0.55"
      />
      <path
        d="M0 24c40-10 80-10 120 0s80 10 120 0 80-10 120 0 80 10 120 0 80-10 120 0 80 10 120 0 80-10 120 0"
        stroke={TONE_FILL[tone]}
        strokeWidth="1.5"
        opacity="0.35"
      />
    </svg>
  );
}

export function SugidanonMark({
  className,
  light = false,
  showTagline = true,
  size = "md",
  stacked = false,
}: {
  className?: string;
  light?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  /** Icon above wordmark (auth hero). */
  stacked?: boolean;
}) {
  const iconSize =
    size === "xl" ? 128 : size === "lg" ? 72 : size === "sm" ? 50 : 66;

  return (
    <span
      className={cn(
        "inline-flex",
        stacked
          ? "flex-col items-center gap-3 text-center"
          : "items-center gap-2.5",
        className,
      )}
    >
      <Image
        src="/brand/sugidanon-icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-full"
        priority
      />
      <span
        className={cn(
          "flex min-w-0 flex-col leading-tight",
          stacked && "items-center",
        )}
      >
        <span
          className={cn(
            "font-display font-semibold tracking-tight",
            size === "xl"
              ? "text-4xl sm:text-5xl"
              : size === "lg"
                ? "text-2xl"
                : size === "sm"
                  ? "text-lg"
                  : "text-xl",
            light ? "text-white" : "text-sl-navy",
          )}
        >
          Sugidanon
        </span>
        {showTagline ? (
          <span
            className={cn(
              "font-medium",
              stacked
                ? "mt-1 text-xs italic tracking-wide sm:text-sm"
                : "text-[10px] uppercase tracking-[0.12em]",
              light ? "text-sl-gold-soft" : "text-sl-gold",
            )}
          >
            Stories Today, Heritage Always.
          </span>
        ) : null}
      </span>
    </span>
  );
}


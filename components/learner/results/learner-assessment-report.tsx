"use client";

import Image from "next/image";
import { Caveat } from "next/font/google";
import { forwardRef } from "react";

import { ResultsScoreCards, formatCompletedDate } from "@/components/learner/results/results-score-cards";
import type { LearnerResultsDashboardView } from "@/types/assessment";
import { cn } from "@/lib/utils";

const script = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

interface LearnerAssessmentReportProps {
  view: LearnerResultsDashboardView;
  className?: string;
}

export const LearnerAssessmentReport = forwardRef<
  HTMLDivElement,
  LearnerAssessmentReportProps
>(function LearnerAssessmentReport({ view, className }, ref) {
  const name = view.learnerDisplayName?.trim() || "Learner";

  return (
    <div
      ref={ref}
      className={cn(
        "learner-assessment-report mx-auto w-full max-w-[720px] overflow-hidden rounded-sm bg-[var(--sl-cream-deep)] text-sl-ink shadow-xl",
        className,
      )}
    >
      <div className="space-y-6 px-8 py-8 sm:px-10 sm:py-10">
        <header className="flex flex-col items-start gap-3 border-b border-[color:rgba(44,36,22,0.12)] pb-5">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/sugilearn-icon.png"
              alt=""
              width={52}
              height={52}
              className="rounded-full"
            />
            <div>
              <p className="font-display text-xl font-semibold text-sl-navy">
                SugiLearn
              </p>
              <p className="text-xs tracking-wide text-sl-ink-muted">
                Stories Today. Heritage Always.
              </p>
            </div>
          </div>
          <h1 className="pt-2 text-sm font-bold uppercase tracking-[0.22em] text-sl-navy">
            Learner Assessment Report
          </h1>
        </header>

        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-sl-ink-muted">
              Name
            </dt>
            <dd className="mt-0.5 font-medium text-sl-navy">{name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-sl-ink-muted">
              Date
            </dt>
            <dd className="mt-0.5 font-medium text-sl-navy">
              {formatCompletedDate(view.completedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-sl-ink-muted">
              Status
            </dt>
            <dd className="mt-0.5 font-medium text-sl-navy">Completed</dd>
          </div>
        </dl>

        <ResultsScoreCards view={view} compact />
      </div>

      <div className="relative mt-2 min-h-[220px] overflow-hidden sm:min-h-[280px]">
        <Image
          src="/images/landing-hero.png"
          alt=""
          fill
          className="object-cover object-center grayscale contrast-110"
          sizes="720px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[rgba(247,239,228,0.55)] via-transparent to-[rgba(247,239,228,0.2)]"
          aria-hidden="true"
        />
        <p
          className={cn(
            script.className,
            "absolute bottom-8 right-6 max-w-[12rem] text-right text-3xl leading-tight text-sl-navy sm:bottom-10 sm:right-10 sm:text-4xl",
          )}
        >
          Heritage Lives Forward
        </p>
      </div>
    </div>
  );
});

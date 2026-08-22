import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Lock, Users } from "lucide-react";

import { HeritageWave, SugidanonMark } from "@/components/brand/heritage-wave";
import { StartPreTestButton } from "@/components/learner/start-pre-test-button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sl-cream font-body text-sl-ink">
      <header className="relative z-20 bg-sl-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <SugidanonMark light showTagline={false} />
          <div className="flex items-center gap-5 sm:gap-6">
            <a
              href="#about"
              className="text-sm text-white/85 transition hover:text-white"
            >
              About
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-sl-gold px-4 py-2 text-sm font-medium text-sl-gold transition hover:bg-sl-gold/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-[min(92vh,880px)] overflow-hidden">
        <Image
          src="/images/landing-hero.png"
          alt="A person in traditional dress overlooking a coastal village, sailboats, and mountains at sunset"
          fill
          priority
          className="object-cover object-[center_45%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[rgba(6,16,28,0.88)] via-[rgba(6,16,28,0.55)] to-[rgba(6,16,28,0.15)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[rgba(6,16,28,0.55)] via-transparent to-[rgba(6,16,28,0.25)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[min(92vh,880px)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
          <div className="max-w-xl space-y-6 text-white">
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Discover the Stories of Panay
            </h1>
            <p className="max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
              An interactive learning experience that brings the Sugidanon to
              life — for greater learners, a brighter tomorrow.
            </p>
            <div className="space-y-3 pt-1">
              <StartPreTestButton />
              <p className="flex items-center gap-2 text-sm text-white/70">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Enter your name to begin — no account required.
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <svg
            viewBox="0 0 1440 96"
            className="h-16 w-full text-sl-cream sm:h-20"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M0 64c120-40 240-40 360 0s240 40 360 0 240-40 360 0 240 40 360 0v32H0V64Z"
            />
          </svg>
        </div>
      </section>

      <section
        id="about"
        className="relative overflow-hidden bg-sl-cream px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <div
            className="mx-auto h-2 w-2 rotate-45 bg-sl-gold"
            aria-hidden="true"
          />
          <h2 className="font-display text-2xl font-semibold tracking-tight text-sl-navy sm:text-3xl">
            A World of Stories Awaits
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-sl-ink-muted sm:text-base">
            Explore narratives from the Sugidanon of Panay through animation,
            assessment, and guided learning.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 border-t border-[color:rgba(44,36,22,0.1)] pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[color:rgba(44,36,22,0.1)]">
          {[
            { icon: BookOpen, label: "Stories that inspire" },
            { icon: Users, label: "Characters that live on" },
            { icon: ArrowRight, label: "Learning for today" },
            { icon: Lock, label: "A brighter future together" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-3 px-4 text-center text-sl-ink"
            >
              <item.icon
                className="h-7 w-7 text-sl-navy"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-[color:rgba(44,36,22,0.08)] bg-sl-cream-deep px-4 py-10 text-center">
        <HeritageWave className="absolute inset-x-0 bottom-0 h-12 opacity-30" />
        <p className="relative text-sm text-sl-ink-muted">
          Need help? Start from the home page, or contact your program
          administrator.
        </p>
      </footer>
    </div>
  );
}

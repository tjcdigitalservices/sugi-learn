import { ArrowRight, BookOpen, Lock, Users } from "lucide-react";

import { HeritageWave, SuguidanonMark } from "@/components/brand/heritage-wave";
import { LandingHero } from "@/components/landing/landing-hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b1d3a] font-body text-sl-ink">
      <header className="landing-nav absolute inset-x-0 top-0 z-20">
        <div className="landing-nav__inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6">
          <div className="landing-nav__brand -ml-[5%]">
            <SuguidanonMark
              light
              showTagline={false}
              size="sm"
              wordmarkTone="antique"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            <a
              href="#about"
              className="hidden text-sm transition sm:inline"
            >
              About
            </a>
          </div>
        </div>
      </header>

      <LandingHero />

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
            Explore narratives from the Suguidanon of Panay through animation,
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

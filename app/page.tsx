import Link from "next/link";

import { HeritageWave, SuguidanonMark } from "@/components/brand/heritage-wave";
import { LandingHero } from "@/components/landing/landing-hero";

const PEOPLE_LINKS = [
  {
    href: "/author",
    title: "Meet the Authors",
    description: "Meet the voices behind the stories.",
  },
  {
    href: "/researchers",
    title: "Meet the Researchers",
    description: "Meet the people behind the research.",
  },
] as const;

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
        </div>
      </header>

      <LandingHero />

      <section
        id="about"
        className="relative overflow-hidden bg-sl-cream px-4 py-16 sm:px-6 sm:py-20"
      >
        {/* Introduction */}
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

        {/* People Behind SugiLearn — clickable */}
        <div className="mx-auto mt-12 max-w-3xl border-t border-[color:rgba(44,36,22,0.1)] pt-10">
          <h3 className="text-center font-display text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-sl-navy/70">
            People Behind Suguidanon
          </h3>
          <ul className="mt-8 grid list-none gap-8 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-[color:rgba(44,36,22,0.1)]">
            {PEOPLE_LINKS.map((item) => (
              <li key={item.href} className="px-4 text-center sm:px-8">
                <Link
                  href={item.href}
                  className="group inline-flex flex-col items-center gap-2 rounded-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--sl-gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--sl-cream)]"
                >
                  <span className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-sl-navy transition group-hover:text-[color:var(--sl-forest)] group-hover:underline group-hover:underline-offset-4">
                    {item.title}
                    <span
                      className="ml-1.5 inline-block font-body text-[0.7rem] font-normal tracking-normal text-[color:var(--sl-gold)] transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                  <span className="max-w-[14rem] text-sm leading-relaxed text-sl-ink-muted transition group-hover:text-sl-ink">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="relative border-t border-[color:rgba(44,36,22,0.08)] bg-sl-cream-deep px-4 py-10 text-center">
        <HeritageWave className="absolute inset-x-0 bottom-0 h-12 opacity-30" />
        <p className="relative text-sm text-sl-ink-muted">
          Looking for your way forward? Return{" "}
          <Link href="/" className="text-sl-navy underline-offset-2 hover:underline">
            home
          </Link>{" "}
          or continue exploring the world of Suguidanon.
        </p>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HeritageWave, SuguidanonMark } from "@/components/brand/heritage-wave";
import {
  getResearcherBySlug,
  RESEARCHERS,
  RESEARCHERS_AFFILIATION,
} from "@/lib/content/researchers";

import "@/components/researchers/researchers-page.css";

interface ResearcherProfilePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return RESEARCHERS.map((researcher) => ({ slug: researcher.slug }));
}

export async function generateMetadata({
  params,
}: ResearcherProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const researcher = getResearcherBySlug(slug);
  if (!researcher) {
    return { title: "Researcher | Suguidanon" };
  }
  return {
    title: `${researcher.name} | Suguidanon`,
    description: `${researcher.name} — ${RESEARCHERS_AFFILIATION}.`,
  };
}

/**
 * Individual researcher profile shell.
 * Shows only approved name, portrait, and affiliation — no invented biography.
 */
export default async function ResearcherProfilePage({
  params,
}: ResearcherProfilePageProps) {
  const { slug } = await params;
  const researcher = getResearcherBySlug(slug);
  if (!researcher) {
    notFound();
  }

  return (
    <div className="researchers-page font-body">
      <header className="researchers-page__nav">
        <div className="researchers-page__nav-inner">
          <Link href="/" className="-ml-[2%] sm:-ml-[5%]">
            <SuguidanonMark
              light
              showTagline={false}
              size="sm"
              wordmarkTone="antique"
            />
          </Link>
        </div>
      </header>

      <section className="researchers-hero" aria-labelledby="researcher-profile-heading">
        <div className="researchers-hero__media" aria-hidden="true">
          <Image
            src="/images/landing-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="researchers-hero__image"
          />
          <div className="researchers-hero__veil" />
        </div>
        <div className="researchers-hero__content">
          <div className="researchers-hero__mark" aria-hidden="true" />
          <h1 id="researcher-profile-heading" className="researchers-hero__heading">
            {researcher.name}
          </h1>
          <p className="researchers-hero__affiliation">
            {RESEARCHERS_AFFILIATION}
          </p>
        </div>
      </section>

      <section className="researchers-roster" aria-label="Researcher portrait">
        <div className="mx-auto flex max-w-sm flex-col items-center px-4 text-center sm:px-0">
          <div className="researchers-roster__frame w-full max-w-[18rem]">
            <Image
              src={researcher.imageSrc}
              alt={researcher.imageAlt}
              fill
              sizes="18rem"
              className="researchers-roster__photo"
              priority
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-sl-ink-muted">
            Researcher
          </p>
          <p className="mt-8">
            <Link
              href="/researchers"
              className="researchers-closing__cta-btn"
            >
              ← Back to Researchers
            </Link>
          </p>
        </div>
      </section>

      <footer className="researchers-page__footer">
        <HeritageWave className="absolute inset-x-0 bottom-0 h-12 opacity-30" />
        <p>
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

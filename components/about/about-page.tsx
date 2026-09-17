import Image from "next/image";
import Link from "next/link";

import { HeritageWave, SuguidanonMark } from "@/components/brand/heritage-wave";
import {
  ABOUT_PAGE_COPY,
  FEDERICO_CABALLERO_PHOTO_CREDIT,
  paragraphsFromNoticeBody,
} from "@/lib/content/federico-caballero";
import type { CharacterRepresentationNoticeCopy } from "@/types/site-notice";

import "./about-page.css";

interface AboutPageProps {
  biography: CharacterRepresentationNoticeCopy;
}

/**
 * Immersive cultural About experience.
 * Biography body is admin-editable; section chrome copy uses approved defaults.
 * Do not invent biographical facts or present Caballero as sole author of the tradition.
 */
export function AboutPageView({ biography }: AboutPageProps) {
  const paragraphs = paragraphsFromNoticeBody(biography.body);
  const closingParagraphs = ABOUT_PAGE_COPY.closing.body.split("\n\n");

  return (
    <div className="about-page font-body">
      <header className="about-page__nav">
        <div className="about-page__nav-inner">
          <Link href="/" className="-ml-[2%] sm:-ml-[5%]">
            <SuguidanonMark
              light
              showTagline={false}
              size="sm"
              wordmarkTone="antique"
            />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6" aria-label="About">
            <Link href="/" className="about-page__nav-link">
              Home
            </Link>
            <Link href="/about" className="about-page__nav-link" aria-current="page">
              About
            </Link>
            <Link href="/researchers" className="about-page__nav-link">
              Researchers
            </Link>
          </nav>
        </div>
      </header>

      {/* Section 1 — Hero */}
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div className="about-hero__media" aria-hidden="true">
          <Image
            src="/images/landing-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="about-hero__image"
          />
          <div className="about-hero__veil" />
        </div>
        <div className="about-hero__content">
          <div className="about-hero__mark" aria-hidden="true" />
          <h1 id="about-hero-heading" className="about-hero__heading">
            {ABOUT_PAGE_COPY.hero.heading}
          </h1>
          <p className="about-hero__subheading">
            {ABOUT_PAGE_COPY.hero.subheading}
          </p>
          <p className="about-hero__supporting">
            {ABOUT_PAGE_COPY.hero.supporting}
          </p>
          <p className="about-hero__intro">{ABOUT_PAGE_COPY.hero.intro}</p>
        </div>
      </section>

      {/* Section 2 — Federico Caballero */}
      <section
        className="about-bio"
        aria-labelledby="about-bio-heading"
        id="federico-caballero"
      >
        <div className="about-bio__grid">
          <figure className="about-bio__figure">
            <div className="about-bio__frame">
              <Image
                src="/images/federico-caballero.png"
                alt="Federico 'Nong Pedring' Caballero"
                fill
                sizes="(max-width: 959px) 100vw, 42vw"
                className="about-bio__photo"
                priority
              />
            </div>
            <figcaption className="about-bio__credit">
              {FEDERICO_CABALLERO_PHOTO_CREDIT}
            </figcaption>
          </figure>

          <div className="about-bio__copy">
            <h2 id="about-bio-heading" className="about-bio__heading">
              {biography.title}
            </h2>
            <div className="about-bio__rule" aria-hidden="true" />
            <div className="about-bio__prose">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — More than an author */}
      <section
        className="about-more"
        aria-labelledby="about-more-heading"
      >
        <div className="about-more__inner">
          <div className="about-more__motif" aria-hidden="true" />
          <h2 id="about-more-heading" className="about-more__heading">
            {ABOUT_PAGE_COPY.moreThanAuthor.heading}
          </h2>
          <p className="about-more__body">
            {ABOUT_PAGE_COPY.moreThanAuthor.body}
          </p>
        </div>
      </section>

      {/* Section 4 — Legacy */}
      <section
        className="about-legacy"
        aria-labelledby="about-legacy-heading"
      >
        <div className="about-legacy__media" aria-hidden="true">
          <Image
            src="/images/landing-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="about-legacy__image"
          />
          <div className="about-legacy__veil" />
        </div>
        <div className="about-legacy__inner">
          <h2 id="about-legacy-heading" className="about-legacy__heading">
            {ABOUT_PAGE_COPY.legacy.heading}
          </h2>
          <ul className="about-legacy__pillars">
            {ABOUT_PAGE_COPY.legacy.pillars.map((pillar) => (
              <li key={pillar.title} className="about-legacy__pillar">
                <h3 className="about-legacy__pillar-title">{pillar.title}</h3>
                <p className="about-legacy__pillar-body">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 5 — Closing */}
      <section
        className="about-closing"
        aria-labelledby="about-closing-heading"
      >
        <div className="about-closing__inner">
          <div className="about-closing__mark" aria-hidden="true" />
          <h2 id="about-closing-heading" className="about-closing__heading">
            {ABOUT_PAGE_COPY.closing.heading}
          </h2>
          <div className="about-closing__body">
            {closingParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="about-closing__cta">
            <Link href="/" className="about-closing__cta-btn">
              {ABOUT_PAGE_COPY.closing.cta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="about-page__footer">
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

import Image from "next/image";
import Link from "next/link";

import { HeritageWave, SuguidanonMark } from "@/components/brand/heritage-wave";
import {
  RESEARCHERS,
  RESEARCHERS_AFFILIATION,
} from "@/lib/content/researchers";

import "./researchers-page.css";

/**
 * Researchers roster — same chrome/interaction as About (nav, closing CTAs, footer),
 * different content layout (portrait grid, not a single biography arc).
 */
export function ResearchersPageView() {
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

      <section className="researchers-hero" aria-labelledby="researchers-hero-heading">
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
          <h1 id="researchers-hero-heading" className="researchers-hero__heading">
            THE RESEARCHERS
          </h1>
          <p className="researchers-hero__affiliation">
            {RESEARCHERS_AFFILIATION}
          </p>
        </div>
      </section>

      <section className="researchers-roster" aria-label="Researcher portraits">
        <ul className="researchers-roster__list">
          {RESEARCHERS.map((researcher) => (
            <li key={researcher.slug} className="researchers-roster__item">
              <Link
                href={`/researchers/${researcher.slug}`}
                className="researchers-roster__card"
                aria-label={`View profile for ${researcher.name}`}
              >
                <div className="researchers-roster__frame">
                  <Image
                    src={researcher.imageSrc}
                    alt={researcher.imageAlt}
                    fill
                    sizes="(max-width: 639px) 14rem, (max-width: 1023px) 40vw, 20vw"
                    className="researchers-roster__photo"
                  />
                </div>
                <div className="researchers-roster__meta">
                  <h2 className="researchers-roster__name">{researcher.name}</h2>
                  <span className="researchers-roster__action" aria-hidden="true">
                    View Profile →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="researchers-closing">
        <div className="researchers-closing__inner">
          <div className="researchers-closing__cta">
            <Link href="/" className="researchers-closing__cta-btn">
              Explore the Stories
            </Link>
          </div>
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

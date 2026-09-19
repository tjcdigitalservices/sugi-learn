"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";

import { StartPreTestButton } from "@/components/learner/start-pre-test-button";

import "./landing-hero.css";

/**
 * Cinematic storybook opening hero.
 *
 * Art swap: replace `public/images/landing-hero.png` only (same path).
 * Keep all ambient layers below (stars, clouds, fireflies, motes, glows,
 * Ken Burns plate, entrance stagger, desktop parallax) — they are CSS/JS
 * overlays, not part of the image. Do not remove them when changing artwork.
 * Crop (`object-position`) may need a retune for a new composition.
 *
 * CTA auth/navigation: guest start + optional register / sign-in.
 */

const FIREFLIES = [
  { x: "8%", y: "72%", size: 2.6, delay: "0.4s", duration: "5.4s", drift: "6px" },
  { x: "12%", y: "76%", size: 3.0, delay: "1.2s", duration: "5.8s", drift: "7px" },
  { x: "15%", y: "84%", size: 2.4, delay: "2.0s", duration: "6.2s", drift: "-5px" },
  { x: "18%", y: "88%", size: 2.5, delay: "0.8s", duration: "6.6s", drift: "-6px" },
  { x: "22%", y: "78%", size: 3.2, delay: "2.6s", duration: "5.5s", drift: "7px" },
  { x: "28%", y: "82%", size: 3.4, delay: "1.6s", duration: "5.2s", drift: "6px" },
  { x: "32%", y: "90%", size: 2.5, delay: "3.2s", duration: "6.4s", drift: "-7px" },
  { x: "38%", y: "74%", size: 2.8, delay: "0.6s", duration: "5.9s", drift: "5px" },
  { x: "44%", y: "90%", size: 2.2, delay: "1.9s", duration: "7.2s", drift: "6px" },
  { x: "48%", y: "80%", size: 3.0, delay: "2.8s", duration: "5.6s", drift: "-6px" },
  { x: "52%", y: "86%", size: 2.6, delay: "0.9s", duration: "6.0s", drift: "8px" },
  { x: "55%", y: "70%", size: 2.5, delay: "3.5s", duration: "5.0s", drift: "-5px" },
  { x: "58%", y: "74%", size: 3.0, delay: "1.4s", duration: "6.3s", drift: "7px" },
  { x: "62%", y: "70%", size: 2.8, delay: "0.3s", duration: "5.8s", drift: "7px" },
  { x: "65%", y: "92%", size: 2.4, delay: "2.4s", duration: "6.8s", drift: "-6px" },
  { x: "68%", y: "86%", size: 2.8, delay: "1.1s", duration: "6.1s", drift: "-6px" },
  { x: "70%", y: "78%", size: 3.8, delay: "0.5s", duration: "6.6s", drift: "-5px" },
  { x: "72%", y: "68%", size: 2.6, delay: "2.1s", duration: "5.1s", drift: "6px" },
  { x: "74%", y: "58%", size: 2.5, delay: "1.7s", duration: "5.5s", drift: "-5px" },
  { x: "76%", y: "64%", size: 2.6, delay: "0.7s", duration: "5.0s", drift: "8px" },
  { x: "78%", y: "88%", size: 2.8, delay: "3.0s", duration: "6.5s", drift: "-7px" },
  { x: "82%", y: "72%", size: 3.2, delay: "1.3s", duration: "7.0s", drift: "-7px" },
  { x: "85%", y: "60%", size: 2.4, delay: "2.7s", duration: "5.7s", drift: "5px" },
  { x: "88%", y: "80%", size: 2.4, delay: "0.2s", duration: "5.8s", drift: "5px" },
  { x: "91%", y: "74%", size: 3.0, delay: "2.2s", duration: "6.2s", drift: "-6px" },
  { x: "94%", y: "84%", size: 2.5, delay: "3.4s", duration: "6.0s", drift: "7px" },
] as const;

const MAGIC_MOTES = [
  { x: "71%", y: "78%", delay: "0.2s", duration: "3.4s", drift: "-10px" },
  { x: "74%", y: "80%", delay: "0.6s", duration: "3.8s", drift: "8px" },
  { x: "77%", y: "76%", delay: "0.3s", duration: "3.2s", drift: "-6px" },
  { x: "69%", y: "82%", delay: "0.9s", duration: "4.0s", drift: "9px" },
  { x: "79%", y: "74%", delay: "1.2s", duration: "3.6s", drift: "-8px" },
  { x: "73%", y: "84%", delay: "0.4s", duration: "3.3s", drift: "7px" },
  { x: "76%", y: "70%", delay: "1.5s", duration: "3.9s", drift: "-7px" },
  { x: "68%", y: "76%", delay: "0.7s", duration: "3.5s", drift: "6px" },
  { x: "81%", y: "78%", delay: "1.0s", duration: "3.7s", drift: "-5px" },
  { x: "72%", y: "72%", delay: "1.8s", duration: "4.1s", drift: "8px" },
  { x: "75%", y: "86%", delay: "0.5s", duration: "3.4s", drift: "-9px" },
  { x: "66%", y: "80%", delay: "1.4s", duration: "3.8s", drift: "5px" },
] as const;

function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parallaxAllowed() {
  return (
    motionAllowed() &&
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 1024px)").matches
  );
}

export function LandingHero() {
  const rootRef = useRef<HTMLElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const apply = () => {
      const { x, y } = currentRef.current;
      root.style.setProperty("--lh-px", x.toFixed(4));
      root.style.setProperty("--lh-py", y.toFixed(4));
    };

    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      c.x += (t.x - c.x) * 0.07;
      c.y += (t.y - c.y) * 0.07;
      apply();

      const moving = Math.abs(t.x - c.x) > 0.001 || Math.abs(t.y - c.y) > 0.001;
      rafRef.current = moving ? requestAnimationFrame(tick) : null;
    };

    const kick = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!parallaxAllowed()) {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
        kick();
        return;
      }
      const rect = root.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetRef.current.x = Math.max(-1, Math.min(1, nx));
      targetRef.current.y = Math.max(-1, Math.min(1, ny));
      kick();
    };

    const onMediaChange = () => {
      if (!parallaxAllowed()) {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
        kick();
      }
    };

    apply();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = window.matchMedia("(pointer: fine)");
    const widthMq = window.matchMedia("(min-width: 1024px)");
    reduceMq.addEventListener("change", onMediaChange);
    fineMq.addEventListener("change", onMediaChange);
    widthMq.addEventListener("change", onMediaChange);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      reduceMq.removeEventListener("change", onMediaChange);
      fineMq.removeEventListener("change", onMediaChange);
      widthMq.removeEventListener("change", onMediaChange);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="landing-hero"
      aria-label="Suguidanon introduction"
    >
      <div className="landing-hero__stage" aria-hidden="true">
        {/* Background — 2px parallax */}
        <div className="landing-hero__layer landing-hero__layer--bg">
          <div className="landing-hero__plate">
            <Image
              src="/images/landing-hero.png"
              alt="Moonlit Panay landscape with a large tree, star-filled sky, mountains, water, village lights, and a glowing open book"
              fill
              priority
              sizes="100vw"
              className="landing-hero__image"
            />
          </div>
          <div className="landing-hero__clouds" />
          <div className="landing-hero__stars" aria-hidden="true">
            <span className="landing-hero__stars-layer landing-hero__stars-layer--a" />
            <span className="landing-hero__stars-layer landing-hero__stars-layer--b" />
            <span className="landing-hero__stars-layer landing-hero__stars-layer--c" />
          </div>
        </div>

        {/* Mid atmosphere — 4px parallax */}
        <div className="landing-hero__layer landing-hero__layer--mid">
          <div className="landing-hero__veil-far" />
          <div className="landing-hero__village" />
          <div className="landing-hero__water" />
        </div>

        {/* Book / magic — 6px parallax */}
        <div className="landing-hero__layer landing-hero__layer--book">
          <div className="landing-hero__book-glow" />
          <div className="landing-hero__magic">
            {MAGIC_MOTES.map((mote, index) => (
              <span
                key={index}
                className="landing-hero__mote"
                style={
                  {
                    "--mx": mote.x,
                    "--my": mote.y,
                    "--mdelay": mote.delay,
                    "--mdur": mote.duration,
                    "--mdrift": mote.drift,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        {/* Foreground — 10px parallax */}
        <div className="landing-hero__layer landing-hero__layer--fg">
          <div className="landing-hero__vines" />
          <div className="landing-hero__fireflies">
            {FIREFLIES.map((fly, index) => (
              <span
                key={index}
                className="landing-hero__firefly"
                style={
                  {
                    "--fx": fly.x,
                    "--fy": fly.y,
                    "--fsize": `${fly.size}px`,
                    "--fdelay": fly.delay,
                    "--fdur": fly.duration,
                    "--fdrift": fly.drift,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="landing-hero__veil-near" />
        </div>
      </div>

      <div className="landing-hero__readability" aria-hidden="true" />

      <div className="landing-hero__content">
        <div className="landing-hero__copy mx-0 max-w-md space-y-5 text-center sm:space-y-6">
          <div className="landing-hero__lead space-y-2.5 sm:space-y-3">
            <h1 className="landing-hero__title font-editorial text-[2.475rem] font-semibold leading-[1.08] tracking-tight lg:text-[3.3rem] xl:text-[4.125rem]">
              Discover the Stories
              <br aria-hidden="true" />
              of Panay
            </h1>
            <p className="landing-hero__lede mx-auto max-w-[27rem] text-center font-body text-[0.95rem] leading-relaxed lg:max-w-[32rem] lg:text-left lg:text-base lg:leading-[1.55]">
              An interactive learning experience that brings the Suguidanon to
              life — helping learners discover, understand, and carry forward
              the stories of Panay.
            </p>
          </div>
          <div className="landing-hero__actions space-y-3 pt-1">
            <h2 className="landing-hero__journey-label font-editorial text-[0.95rem] font-medium tracking-[0.14em] lg:text-[1.05rem]">
              Begin your learning journey
            </h2>
            <div className="landing-hero__cta flex flex-col items-center gap-3">
              <StartPreTestButton />
              <p className="font-body text-sm text-white/85">
                Already learning?{" "}
                <Link
                  href="/login"
                  className="font-medium text-sl-gold-soft underline underline-offset-4 transition hover:text-white"
                >
                  Sign in
                </Link>
                {" · "}
                <Link
                  href="/register"
                  className="font-medium text-sl-gold-soft underline underline-offset-4 transition hover:text-white"
                >
                  Create account
                </Link>
              </p>
            </div>
            <p className="landing-hero__helper mt-3 flex items-center justify-center gap-2 font-body text-sm">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Start as guest — save an account later to keep your progress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

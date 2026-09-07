"use client";

import {
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";

import type { Chapter } from "@/types/chapter";

export type StorybookTurnDirection = "forward" | "back";

export interface StorybookPageTurnProps {
  direction: StorybookTurnDirection;
  /** Kept for API compatibility; leaf faces are plain paper. */
  fromChapter: Pick<Chapter, "number" | "title" | "subtitle">;
  /** Kept for API compatibility; destination content comes from Layer B, not faces. */
  toChapter?: Pick<Chapter, "number" | "title" | "subtitle"> | null;
  reducedMotion?: boolean;
  /** Fires near the leaf midpoint so the hold can reveal the staged destination spread. */
  onMidReveal?: () => void;
  onComplete: () => void;
}

const TURN_FALLBACK_MS = 900;
const REDUCED_FALLBACK_MS = 280;
/** After ~90° so Layer B does not ghost through the edge-on leaf. */
const MID_REVEAL_MS = 480;
const MID_REVEAL_REDUCED_MS = 40;

/**
 * CSS 3D page-turn leaf for chapter-to-chapter navigation.
 * Destination pages are NOT drawn here — the hold reveals a full staged spread.
 *
 * An opaque shield sits under the 3D leaf (same half) so destination Layer B
 * cannot ghost/mirror through the flipping face mid-turn.
 */
export function StorybookPageTurn({
  direction,
  reducedMotion = false,
  onMidReveal,
  onComplete,
}: StorybookPageTurnProps) {
  const [active, setActive] = useState(false);
  const [shieldOpen, setShieldOpen] = useState(true);
  const completed = useRef(false);
  const midRevealed = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const midTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function revealDestination() {
    if (midRevealed.current) {
      return;
    }
    midRevealed.current = true;
    setShieldOpen(false);
    onMidReveal?.();
  }

  function finish() {
    if (completed.current) {
      return;
    }
    completed.current = true;
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    if (midTimer.current) {
      clearTimeout(midTimer.current);
      midTimer.current = null;
    }
    revealDestination();
    onComplete();
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setActive(true);
    });

    midTimer.current = setTimeout(() => {
      revealDestination();
    }, reducedMotion ? MID_REVEAL_REDUCED_MS : MID_REVEAL_MS);

    fallbackTimer.current = setTimeout(
      finish,
      reducedMotion ? REDUCED_FALLBACK_MS : TURN_FALLBACK_MS,
    );

    return () => {
      window.cancelAnimationFrame(frame);
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
      }
      if (midTimer.current) {
        clearTimeout(midTimer.current);
      }
    };
    // Intentionally run once on mount for this turn instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (
      event.propertyName !== "transform" &&
      event.propertyName !== "opacity"
    ) {
      return;
    }
    finish();
  }

  const rootClass = [
    "sb-turn-root",
    direction === "forward" ? "sb-turn-forward" : "sb-turn-back",
    reducedMotion ? "sb-turn-reduced" : null,
    active ? "is-turning" : null,
    shieldOpen ? null : "is-mid-revealed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} aria-hidden="true">
      {/* Opaque paper under the 3D leaf — blocks Layer B compositor ghosting. */}
      <div className="sb-turn-shield">
        <div className="sb-turn-shield-spine" />
      </div>
      <div className="sb-turn-leaf" onTransitionEnd={handleTransitionEnd}>
        <div className="sb-turn-face sb-turn-face-front" />
        <div className="sb-turn-face sb-turn-face-back sb-turn-face-back--plain" />
      </div>
    </div>
  );
}

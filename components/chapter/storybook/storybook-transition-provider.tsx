"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Chapter } from "@/types/chapter";
import { StorybookSpread } from "@/components/chapter/storybook/storybook-spread";
import {
  StorybookPageTurn,
  type StorybookTurnDirection,
} from "@/components/chapter/storybook/storybook-page-turn";
import { clearStorybookPageTurnNav } from "@/lib/chapter/storybook-session";
import "@/components/chapter/storybook/storybook-book.css";

export interface StorybookHoldSnapshot {
  direction: StorybookTurnDirection;
  targetSlug: string;
  /** Layer A — complete outgoing spread, visible until mid-turn reveal. */
  outgoingChapter: Chapter;
  /** Layer B — complete incoming spread, staged hidden until ready + mid-turn. */
  incomingChapter: Chapter;
  reducedMotion?: boolean;
}

interface StorybookTransitionContextValue {
  beginHold: (snapshot: StorybookHoldSnapshot) => void;
  /** Live destination route open spread has painted. */
  releaseHold: () => void;
  isHolding: boolean;
  targetSlug: string | null;
}

const StorybookTransitionContext =
  createContext<StorybookTransitionContextValue | null>(null);

const HOLD_SAFETY_MS = 12_000;

/**
 * Persists across chapter navigations. Owns a dual-layer hold:
 * Layer A (outgoing) stays visible; Layer B (incoming full spread) is staged
 * invisibly, then revealed as one unit at the page-turn midpoint.
 */
export function StorybookTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hold, setHold] = useState<StorybookHoldSnapshot | null>(null);
  const [layerBReady, setLayerBReady] = useState(false);
  const [revealIncoming, setRevealIncoming] = useState(false);
  const holdRef = useRef<StorybookHoldSnapshot | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnCompleteRef = useRef(false);
  const destinationReadyRef = useRef(false);
  const layerBReadyRef = useRef(false);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const turnSlotRef = useRef<HTMLDivElement | null>(null);

  const clearSafety = useCallback(() => {
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, []);

  const clearHold = useCallback(() => {
    clearSafety();
    clearStorybookPageTurnNav();
    turnCompleteRef.current = false;
    destinationReadyRef.current = false;
    layerBReadyRef.current = false;
    holdRef.current = null;
    setLayerBReady(false);
    setRevealIncoming(false);
    setHold(null);
  }, [clearSafety]);

  const trySettle = useCallback(() => {
    if (
      turnCompleteRef.current &&
      destinationReadyRef.current &&
      layerBReadyRef.current
    ) {
      clearHold();
    }
  }, [clearHold]);

  const releaseHold = useCallback(() => {
    if (!holdRef.current) {
      return;
    }
    destinationReadyRef.current = true;
    trySettle();
  }, [trySettle]);

  const handleLayerBReady = useCallback(() => {
    layerBReadyRef.current = true;
    setLayerBReady(true);
    trySettle();
  }, [trySettle]);

  const handleMidReveal = useCallback(() => {
    setRevealIncoming(true);
  }, []);

  const handleTurnComplete = useCallback(() => {
    turnCompleteRef.current = true;
    // Ensure destination layer is visible if mid-reveal was skipped.
    setRevealIncoming(true);
    trySettle();
  }, [trySettle]);

  const beginHold = useCallback(
    (snapshot: StorybookHoldSnapshot) => {
      clearSafety();
      turnCompleteRef.current = false;
      destinationReadyRef.current = false;
      layerBReadyRef.current = false;
      holdRef.current = snapshot;
      setLayerBReady(false);
      setRevealIncoming(false);
      setHold(snapshot);
      safetyTimer.current = setTimeout(() => {
        clearHold();
      }, HOLD_SAFETY_MS);
    },
    [clearHold, clearSafety],
  );

  useEffect(() => {
    return () => clearSafety();
  }, [clearSafety]);

  // Position the leaf over the outgoing frame.
  useLayoutEffect(() => {
    if (!hold || !layerBReady) {
      return;
    }

    function syncTurnSlot() {
      const stack = stackRef.current;
      const slot = turnSlotRef.current;
      if (!stack || !slot) {
        return;
      }
      const frame = stack.querySelector(
        ".sb-hold-layer--outgoing .sb-frame",
      ) as HTMLElement | null;
      if (!frame) {
        return;
      }
      const stackBox = stack.getBoundingClientRect();
      const frameBox = frame.getBoundingClientRect();
      slot.style.top = `${frameBox.top - stackBox.top}px`;
      slot.style.left = `${frameBox.left - stackBox.left}px`;
      slot.style.width = `${frameBox.width}px`;
      slot.style.height = `${frameBox.height}px`;
    }

    syncTurnSlot();
    const frame = window.requestAnimationFrame(syncTurnSlot);
    window.addEventListener("resize", syncTurnSlot);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncTurnSlot);
    };
  }, [hold, layerBReady, revealIncoming]);

  const value = useMemo(
    () => ({
      beginHold,
      releaseHold,
      isHolding: Boolean(hold),
      targetSlug: hold?.targetSlug ?? null,
    }),
    [beginHold, releaseHold, hold],
  );

  return (
    <StorybookTransitionContext.Provider value={value}>
      {children}
      {hold ? (
        <div
          className="pointer-events-none fixed inset-0 z-[60] overflow-hidden bg-[var(--sl-cream)] pt-[max(4.5rem,env(safe-area-inset-top))] md:pt-[max(0.75rem,env(safe-area-inset-top))]"
          aria-hidden="true"
        >
          <div className="sb-book-view flex h-full min-h-0 flex-col">
            <div className="flex min-h-0 flex-1 flex-col px-2 py-1 sm:px-3 md:px-3 md:py-1">
              <div className="sb-chapter-stage">
                <div className="sb-chapter-stage-book">
                  <div className="sb-hold-stage">
                    <div className="sb-hold-stack" ref={stackRef}>
                      <div
                        className={`sb-hold-layer sb-hold-layer--incoming${
                          revealIncoming ? " is-visible" : ""
                        }`}
                      >
                        <StorybookSpread
                          chapter={hold.incomingChapter}
                          chapterCompleted
                          nextChapterId={null}
                          onSpreadReady={handleLayerBReady}
                        />
                      </div>
                      <div
                        className={`sb-hold-layer sb-hold-layer--outgoing${
                          revealIncoming ? " is-concealed" : ""
                        }`}
                      >
                        <StorybookSpread
                          chapter={hold.outgoingChapter}
                          chapterCompleted
                          nextChapterId={null}
                        />
                      </div>
                      {layerBReady ? (
                        <div className="sb-hold-turn-slot" ref={turnSlotRef}>
                          <StorybookPageTurn
                            key={`${hold.targetSlug}-${hold.direction}`}
                            direction={hold.direction}
                            fromChapter={hold.outgoingChapter}
                            toChapter={hold.incomingChapter}
                            reducedMotion={Boolean(hold.reducedMotion)}
                            onMidReveal={handleMidReveal}
                            onComplete={handleTurnComplete}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </StorybookTransitionContext.Provider>
  );
}

export function useStorybookTransition(): StorybookTransitionContextValue {
  const context = useContext(StorybookTransitionContext);
  if (!context) {
    return {
      beginHold: () => undefined,
      releaseHold: () => undefined,
      isHolding: false,
      targetSlug: null,
    };
  }
  return context;
}

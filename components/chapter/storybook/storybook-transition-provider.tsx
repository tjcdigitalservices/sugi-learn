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
  /** Layer B — complete incoming spread, staged hidden until mid-turn. */
  incomingChapter: Chapter;
  reducedMotion?: boolean;
  /** Keep hold spreads visually matched to the live open book. */
  chrome?: ReactNode;
  previousChapterId?: string | null;
  nextChapterId?: string | null;
  continueLabel?: string;
}

interface StorybookTransitionContextValue {
  beginHold: (snapshot: StorybookHoldSnapshot) => void;
  /** Live destination route open spread has painted. */
  releaseHold: () => void;
  /** Lock open-book controls for a user-started chapter turn. */
  beginTurnBusy: () => void;
  /** Clear after the destination book is interactive. */
  endTurnBusy: () => void;
  isHolding: boolean;
  /** Survives LearnerChapterLayout remounts during navigation. */
  turnBusy: boolean;
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
  const [turnBusy, setTurnBusy] = useState(false);
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

  const beginTurnBusy = useCallback(() => {
    setTurnBusy(true);
  }, []);

  const endTurnBusy = useCallback(() => {
    setTurnBusy(false);
  }, []);

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
      setTurnBusy(true);
      setLayerBReady(false);
      setRevealIncoming(false);
      setHold(snapshot);
      safetyTimer.current = setTimeout(() => {
        clearHold();
        setTurnBusy(false);
      }, HOLD_SAFETY_MS);
    },
    [clearHold, clearSafety],
  );

  useEffect(() => {
    return () => clearSafety();
  }, [clearSafety]);

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
      const page = stack.querySelector(
        ".sb-hold-layer--outgoing .sb-frame > .sb-spread",
      ) as HTMLElement | null;
      if (!page) {
        return;
      }
      const stackBox = stack.getBoundingClientRect();
      const pageBox = page.getBoundingClientRect();
      slot.style.top = `${pageBox.top - stackBox.top}px`;
      slot.style.left = `${pageBox.left - stackBox.left}px`;
      slot.style.width = `${pageBox.width}px`;
      slot.style.height = `${pageBox.height}px`;
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
      beginTurnBusy,
      endTurnBusy,
      isHolding: Boolean(hold),
      turnBusy: turnBusy || Boolean(hold),
      targetSlug: hold?.targetSlug ?? null,
    }),
    [beginHold, beginTurnBusy, endTurnBusy, hold, releaseHold, turnBusy],
  );

  return (
    <StorybookTransitionContext.Provider value={value}>
      {children}
      {hold ? (
        <div
          className="pointer-events-none fixed inset-0 z-[60] overflow-hidden bg-[var(--sl-cream)] pt-[max(0.75rem,env(safe-area-inset-top))]"
          aria-hidden="true"
          aria-busy="true"
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
                          turning
                          previousChapterId={
                            hold.direction === "forward"
                              ? hold.outgoingChapter.id
                              : hold.previousChapterId ?? null
                          }
                          nextChapterId={
                            hold.direction === "back"
                              ? hold.outgoingChapter.id
                              : hold.nextChapterId ?? null
                          }
                          continueLabel={hold.continueLabel}
                          chrome={hold.chrome}
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
                          turning
                          previousChapterId={hold.previousChapterId ?? null}
                          nextChapterId={hold.nextChapterId ?? null}
                          continueLabel={hold.continueLabel}
                          chrome={hold.chrome}
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
      beginTurnBusy: () => undefined,
      endTurnBusy: () => undefined,
      isHolding: false,
      turnBusy: false,
      targetSlug: null,
    };
  }
  return context;
}

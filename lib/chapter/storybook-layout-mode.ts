"use client";

import { useLayoutEffect, useState } from "react";

export type StorybookLayoutMode = "spread" | "paged";

/** Canonical open-book width (px); spread needs at least this scaled size. */
const OPEN_MAX_W = 1400;
const OPEN_MAX_H = 786;
/** Minimum comfortable open-book width before switching to single-page. */
const MIN_SPREAD_OPEN_W = 720;
/** Horizontal padding from learner shell. */
const SHELL_PAD_X = 24;
/**
 * Vertical chrome: desktop book view is headerless (~2.75rem); mobile includes
 * the learner header. Prefer a slightly generous estimate so we switch to
 * paged before pages become unreadably narrow.
 */
const BOOK_VIEW_CHROME_Y_DESKTOP = 44;
const BOOK_VIEW_CHROME_Y_MOBILE = 184;

function computeLayoutMode(): StorybookLayoutMode {
  if (typeof window === "undefined") {
    return "spread";
  }

  // Portrait / narrow viewports always use the single-page storybook.
  if (window.matchMedia("(max-width: 767px)").matches) {
    return "paged";
  }

  const chromeY = window.matchMedia("(min-width: 768px)").matches
    ? BOOK_VIEW_CHROME_Y_DESKTOP
    : BOOK_VIEW_CHROME_Y_MOBILE;

  const availableW = Math.max(0, window.innerWidth - SHELL_PAD_X);
  const availableH = Math.max(
    0,
    Math.min(window.innerHeight, window.visualViewport?.height ?? window.innerHeight) -
      chromeY,
  );

  const openWidth = Math.min(
    availableW,
    OPEN_MAX_W,
    availableH * (OPEN_MAX_W / OPEN_MAX_H),
  );

  return openWidth >= MIN_SPREAD_OPEN_W ? "spread" : "paged";
}

/**
 * Fit-based storybook layout: two-page spread when the scaled open book
 * can fit with readable pages; otherwise single-page paging.
 */
export function useStorybookLayoutMode(): StorybookLayoutMode {
  // SSR + first paint default to spread; layout effect corrects immediately.
  const [mode, setMode] = useState<StorybookLayoutMode>("spread");

  useLayoutEffect(() => {
    function update() {
      setMode(computeLayoutMode());
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      mq.removeEventListener("change", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  return mode;
}

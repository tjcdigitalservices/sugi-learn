/** Session flag: land on open spread after a chapter page-turn navigation. */
export const STORYBOOK_ARRIVE_OPEN_KEY = "sugi-storybook-arrive-open";

/** Cookie: suppress [chapterId] loading skeleton during storybook page-turn nav. */
export const STORYBOOK_PAGE_TURN_COOKIE = "sugi-storybook-page-turn";

export function markStorybookArriveOpen(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(STORYBOOK_ARRIVE_OPEN_KEY, "1");
  } catch {
    // Ignore quota / private mode failures — navigation still proceeds.
  }
}

/** Peek without clearing — safe across remounts during the same turn. */
export function peekStorybookArriveOpen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return sessionStorage.getItem(STORYBOOK_ARRIVE_OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Read and clear the arrive-open flag. */
export function consumeStorybookArriveOpen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const value = sessionStorage.getItem(STORYBOOK_ARRIVE_OPEN_KEY);
    if (value) {
      sessionStorage.removeItem(STORYBOOK_ARRIVE_OPEN_KEY);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/** Set short-lived cookie so loading.tsx can skip the skeleton. */
export function markStorybookPageTurnNav(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${STORYBOOK_PAGE_TURN_COOKIE}=1; Path=/; Max-Age=30; SameSite=Lax`;
}

/** Clear the page-turn nav cookie. */
export function clearStorybookPageTurnNav(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${STORYBOOK_PAGE_TURN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

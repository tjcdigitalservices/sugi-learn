/**
 * Logs client-side errors in development only.
 * Production users see generic error boundaries — not stack traces.
 */
export function logClientError(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

/** Public routes that do not require authentication. */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/unauthorized",
] as const;

export const AUTH_LOGIN_ROUTE = "/login";
export const ADMIN_HOME_ROUTE = "/admin";
export const LEARNER_HOME_ROUTE = "/learn";
export const UNAUTHORIZED_ROUTE = "/unauthorized";

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string): boolean {
  return (
    pathname === ADMIN_HOME_ROUTE || pathname.startsWith(`${ADMIN_HOME_ROUTE}/`)
  );
}

export function isLearnerRoute(pathname: string): boolean {
  return (
    pathname === LEARNER_HOME_ROUTE ||
    pathname.startsWith(`${LEARNER_HOME_ROUTE}/`)
  );
}

export function isAuthLoginRoute(pathname: string): boolean {
  return pathname === AUTH_LOGIN_ROUTE;
}

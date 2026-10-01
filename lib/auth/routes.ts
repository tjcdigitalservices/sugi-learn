/** Public routes that do not require authentication. */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/author",
  "/researchers",
  "/login",
  "/register",
  "/admin/login",
  "/unauthorized",
] as const;

export const AUTH_LOGIN_ROUTE = "/login";
export const AUTH_REGISTER_ROUTE = "/register";
export const ADMIN_LOGIN_ROUTE = "/admin/login";
export const ADMIN_HOME_ROUTE = "/admin";
export const LEARNER_HOME_ROUTE = "/learn";
export const UNAUTHORIZED_ROUTE = "/unauthorized";

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAdminRoute(pathname: string): boolean {
  if (pathname === ADMIN_LOGIN_ROUTE || pathname.startsWith(`${ADMIN_LOGIN_ROUTE}/`)) {
    return false;
  }
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
  return (
    pathname === AUTH_LOGIN_ROUTE ||
    pathname === AUTH_REGISTER_ROUTE ||
    pathname === ADMIN_LOGIN_ROUTE
  );
}

export function isAdminLoginRoute(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_ROUTE;
}

export function isLearnerLoginRoute(pathname: string): boolean {
  return pathname === AUTH_LOGIN_ROUTE;
}

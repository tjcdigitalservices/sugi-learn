import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_LOGIN_ROUTE,
  isAdminRoute,
  isAuthLoginRoute,
  isLearnerRoute,
  isPublicRoute,
  UNAUTHORIZED_ROUTE,
} from "@/lib/auth/routes";
import { resolvePostLoginPath, defaultPostLoginPath } from "@/lib/auth/post-login";
import { learnerNeedsOnboarding } from "@/lib/learner/onboarding";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type { Database } from "@/types/database";
import type { UserRole } from "@/types/database";

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return { url, anonKey };
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Application is not configured.", { status: 503 });
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getPublicSupabaseConfig();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname) && !isAuthLoginRoute(pathname)) {
    return supabaseResponse;
  }

  if (isAuthLoginRoute(pathname)) {
    if (user) {
      const profile = await fetchUserProfile(supabase, user.id);
      // Only skip the login form when already signed in as admin.
      // Guest/learner sessions must still reach /login to switch to admin.
      if (profile?.role === "admin") {
        const nextParam = request.nextUrl.searchParams.get("next");
        const destination = resolvePostLoginPath(
          "admin",
          nextParam ?? defaultPostLoginPath("admin"),
          profile.displayName,
        );
        return redirectWithCookies(
          supabaseResponse,
          new URL(destination, request.url),
        );
      }
    }

    return supabaseResponse;
  }

  if (!user) {
    // Learners start from the landing CTA (anonymous session), not /login.
    if (isLearnerRoute(pathname)) {
      return redirectWithCookies(supabaseResponse, new URL("/", request.url));
    }

    const loginUrl = new URL(AUTH_LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWithCookies(supabaseResponse, loginUrl);
  }

  if (isAdminRoute(pathname)) {
    const profile = await fetchUserProfile(supabase, user.id);

    if (profile?.role !== "admin") {
      return redirectWithCookies(
        supabaseResponse,
        new URL(UNAUTHORIZED_ROUTE, request.url),
      );
    }
  }

  if (isLearnerRoute(pathname)) {
    const profile = await fetchUserProfile(supabase, user.id);
    const onOnboarding = pathname.startsWith("/learn/onboarding");

    if (!profile) {
      await supabase.from("profiles").upsert(
        { id: user.id, role: "learner" },
        { onConflict: "id" },
      );
    }

    const resolvedProfile = profile ?? (await fetchUserProfile(supabase, user.id));

    if (
      resolvedProfile?.role === "learner" &&
      learnerNeedsOnboarding(resolvedProfile.displayName) &&
      !onOnboarding
    ) {
      return redirectWithCookies(
        supabaseResponse,
        new URL("/learn/onboarding", request.url),
      );
    }
  }

  return supabaseResponse;
}

async function fetchUserProfile(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
): Promise<{ role: UserRole; displayName: string | null } | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  return {
    role: profile.role,
    displayName: profile.display_name,
  };
}

function redirectWithCookies(
  response: NextResponse,
  url: URL,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);

  for (const cookie of response.cookies.getAll()) {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  }

  return redirectResponse;
}

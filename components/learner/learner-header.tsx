"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { SugiLearnMark } from "@/components/brand/heritage-wave";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const LEARNER_NAV: {
  href: string;
  label: string;
  exact?: boolean;
}[] = [
  { href: "/learn", label: "Home", exact: true },
  { href: "/learn/assessment/pre", label: "Pre-Test" },
  { href: "/learn/chapters", label: "Chapters" },
  { href: "/learn/assessment/post", label: "Post-Test" },
  { href: "/learn/results", label: "Results" },
];

function isNavItemActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface LearnerHeaderProps {
  userLabel?: string | null;
  focused?: boolean;
}

export function LearnerHeader({ userLabel, focused = false }: LearnerHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isFocused =
    focused ||
    pathname.startsWith("/learn/onboarding") ||
    pathname.startsWith("/learn/assessment/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <header className="bg-sl-navy text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/learn" className="shrink-0">
          <SugiLearnMark light showTagline={false} />
        </Link>

        {!isFocused ? (
          <nav
            aria-label="Learner navigation"
            className="hidden flex-wrap items-center gap-4 text-sm text-white/80 md:flex"
          >
            {LEARNER_NAV.map((item) => {
              const active = isNavItemActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold",
                    active ? "font-semibold text-sl-gold" : null,
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {userLabel ? (
              <span className="hidden max-w-[10rem] truncate text-xs text-white/60 lg:inline">
                {userLabel}
              </span>
            ) : null}
            {userLabel ? (
              <SignOutButton className="border-white/20 bg-transparent text-white hover:bg-white/10" />
            ) : null}
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            {userLabel ? (
              <span className="hidden text-xs text-white/70 sm:inline">
                {userLabel}
              </span>
            ) : null}
            {userLabel ? (
              <SignOutButton className="border-white/20 bg-transparent text-white hover:bg-white/10" />
            ) : null}
          </div>
        )}

        {!isFocused ? (
          <div className="flex items-center gap-2 md:hidden">
            {userLabel ? (
              <SignOutButton className="border-white/20 bg-transparent px-2 py-1 text-xs text-white hover:bg-white/10" />
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="learner-mobile-nav"
              aria-label="Open navigation menu"
              className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {!isFocused ? (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
              open ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={!open}
            onClick={() => setOpen(false)}
          />

          <aside
            id="learner-mobile-nav"
            aria-label="Learner navigation"
            aria-hidden={!open}
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-white/10 bg-sl-navy shadow-lg transition-transform duration-200 ease-out md:hidden",
              open ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <p className="font-display text-lg font-semibold text-white">
                SugiLearn
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {LEARNER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    isNavItemActive(pathname, item.href, item.exact)
                      ? "page"
                      : undefined
                  }
                  className="rounded-md px-3 py-2 text-sm text-white/85 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
                >
                  {item.label}
                </Link>
              ))}
              {userLabel ? (
                <p className="mt-4 truncate px-3 text-xs text-white/60">
                  {userLabel}
                </p>
              ) : null}
            </nav>
          </aside>
        </>
      ) : null}
    </header>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { SugidanonMark } from "@/components/brand/heritage-wave";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

interface AdminMobileNavProps {
  open: boolean;
  onClose: () => void;
  userLabel?: string | null;
}

export function AdminMobileNav({
  open,
  onClose,
  userLabel,
}: AdminMobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(7,20,40,0.55)] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        id="admin-mobile-nav"
        aria-label="Admin navigation"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sl-navy text-white shadow-lg transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <SugidanonMark light showTagline={false} size="sm" />
            <p className="mt-1 text-xs text-white/65">Administrator</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-4">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <AdminNavLinks onNavigate={onClose} />
          </div>

          <div className="shrink-0 space-y-3 border-t border-white/10 pt-4">
            {userLabel ? (
              <p
                className="break-all px-1 text-xs leading-snug text-white/65"
                title={userLabel}
              >
                {userLabel}
              </p>
            ) : null}
            <SignOutButton className="w-full justify-center border-white/25 bg-transparent px-3 py-2.5 text-sm text-white hover:bg-white/10 hover:text-white" />
            <Link
              href="/learn"
              onClick={onClose}
              className="block px-1 py-1 text-xs leading-snug text-white/65 hover:text-white"
            >
              Exit to learner site
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

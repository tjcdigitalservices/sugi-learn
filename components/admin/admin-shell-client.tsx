"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

interface AdminShellClientProps {
  children: React.ReactNode;
  userLabel?: string | null;
}

export function AdminShellClient({ children, userLabel }: AdminShellClientProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-sl-cream font-body text-sl-ink">
      {/* Mobile top bar — flex sibling, not sticky-over-calc, so height never double-counts */}
      <header className="flex shrink-0 items-center gap-2 border-b border-[color:rgba(44,36,22,0.08)] bg-[var(--sl-cream-deep)] px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          aria-label="Open navigation menu"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-sl-ink-muted transition-colors hover:bg-white/70 hover:text-sl-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-sl-navy">
            Suguidanon Admin
          </p>
          {userLabel ? (
            <p className="truncate text-xs text-sl-ink-muted" title={userLabel}>
              {userLabel}
            </p>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <AdminSidebar
          userLabel={userLabel}
          className="sticky top-0 z-20 hidden h-full lg:flex"
        />
        <AdminMobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          userLabel={userLabel}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl pb-[max(1rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

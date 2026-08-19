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
    <div className="h-dvh overflow-hidden bg-sl-cream font-body text-sl-ink">
      {/* Mobile menu trigger only — no full admin header bar */}
      <div className="sticky top-0 z-30 flex h-12 items-center border-b border-[color:rgba(44,36,22,0.08)] bg-[var(--sl-cream-deep)] px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-sl-ink-muted transition-colors hover:bg-white/70 hover:text-sl-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="ml-2 font-display text-sm font-semibold text-sl-navy">
          SugiLearn Admin
        </p>
      </div>

      <div className="flex h-[calc(100dvh-3rem)] lg:h-dvh">
        {/* In-flow sidebar on desktop — avoids fixed + margin overlap bugs */}
        <AdminSidebar
          userLabel={userLabel}
          className="sticky top-0 z-20 hidden h-full lg:flex"
        />
        <AdminMobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          userLabel={userLabel}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

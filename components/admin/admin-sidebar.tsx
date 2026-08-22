import Link from "next/link";

import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { SugidanonMark } from "@/components/brand/heritage-wave";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userLabel?: string | null;
  className?: string;
}

export function AdminSidebar({ userLabel, className }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col bg-sl-navy text-white",
        className,
      )}
    >
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <Link
          href="/admin"
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-navy)]"
        >
          <SugidanonMark light showTagline={false} size="sm" />
        </Link>
        <p className="mt-1 text-xs leading-snug text-white/65">
          Admin · Panay Bukidnon Sugidanon
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <AdminNavLinks />
      </div>

      <div className="shrink-0 space-y-3 border-t border-white/10 px-3 py-4">
        <div className="px-1">
          {userLabel ? (
            <p
              className="break-all text-xs leading-snug text-white/65"
              title={userLabel}
            >
              {userLabel}
            </p>
          ) : null}
          <p className="mt-1 text-xs font-medium text-sl-gold-soft">
            Administrator
          </p>
        </div>
        <SignOutButton className="w-full justify-center border-white/25 bg-transparent px-3 py-2.5 text-sm text-white hover:bg-white/10 hover:text-white" />
        <Link
          href="/learn"
          className="block px-1 py-1 text-xs leading-snug text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
        >
          Exit to learner site
        </Link>
      </div>
    </aside>
  );
}

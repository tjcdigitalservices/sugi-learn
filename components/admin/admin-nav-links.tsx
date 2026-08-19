"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
} from "@/components/admin/nav-config";
import { cn } from "@/lib/utils";

interface AdminNavLinksProps {
  onNavigate?: () => void;
  className?: string;
}

export function AdminNavLinks({ onNavigate, className }: AdminNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className={cn("space-y-1", className)}>
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isAdminNavActive(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-navy)]",
              active
                ? "bg-sl-gold font-semibold text-sl-navy"
                : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 leading-snug">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

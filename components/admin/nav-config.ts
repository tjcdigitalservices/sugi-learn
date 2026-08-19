import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Image,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match pathname exactly (used for /admin dashboard). */
  exact?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/chapters", label: "Chapters", icon: BookOpen },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/assessments", label: "Assessments", icon: ListChecks },
  { href: "/admin/review", label: "Review", icon: ClipboardCheck },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  const match = ADMIN_NAV_ITEMS.find((item) => {
    if (item.exact) {
      return false;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  return match?.label ?? "Administration";
}

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

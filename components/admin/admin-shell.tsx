import { AdminShellClient } from "@/components/admin/admin-shell-client";

interface AdminShellProps {
  children: React.ReactNode;
  userLabel?: string | null;
}

/** PANEL-M01 — Admin shell entry (sidebar + main; see admin-shell-client.tsx) */
export function AdminShell({ children, userLabel }: AdminShellProps) {
  return <AdminShellClient userLabel={userLabel}>{children}</AdminShellClient>;
}

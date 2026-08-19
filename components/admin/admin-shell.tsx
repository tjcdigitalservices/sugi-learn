import { AdminShellClient } from "@/components/admin/admin-shell-client";

interface AdminShellProps {
  children: React.ReactNode;
  userLabel?: string | null;
}

export function AdminShell({ children, userLabel }: AdminShellProps) {
  return <AdminShellClient userLabel={userLabel}>{children}</AdminShellClient>;
}

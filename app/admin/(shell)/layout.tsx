import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userLabel: string | null = null;

  if (hasSupabaseConfig()) {
    const auth = await requireAdmin();
    userLabel = auth.user.email;
  }

  return <AdminShell userLabel={userLabel}>{children}</AdminShell>;
}

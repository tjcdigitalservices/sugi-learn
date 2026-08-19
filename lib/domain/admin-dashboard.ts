import { getRepositories } from "@/lib/data";
import type { AdminDashboardSummary } from "@/types/admin-dashboard";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  return getRepositories().adminDashboard.getDashboardSummary();
}

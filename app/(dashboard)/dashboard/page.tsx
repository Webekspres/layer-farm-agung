import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardStats } from "@/features/dashboard/services/get-dashboard-stats";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { getActiveTenantId } from "@/features/auth/lib/session";

export default async function DashboardPage() {
  const session = await requirePermission("view_dashboard");
  const tenantId = getActiveTenantId(session);
  const stats = tenantId ? await getDashboardStats(tenantId) : null;

  return <DashboardOverview session={session} stats={stats} />;
}

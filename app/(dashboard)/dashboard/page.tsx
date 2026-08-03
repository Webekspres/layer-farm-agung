import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardExecutive } from "@/features/dashboard/services/get-dashboard-executive";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { getActiveTenantId } from "@/features/auth/lib/session";

export default async function DashboardPage() {
  const session = await requirePermission("view_dashboard");
  const tenantId = getActiveTenantId(session);
  const data = tenantId ? await getDashboardExecutive(tenantId) : null;

  return <DashboardOverview session={session} data={data} />;
}

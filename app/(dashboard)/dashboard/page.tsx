import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { requirePermission } from "@/features/auth/lib/require-permission";

export default async function DashboardPage() {
  const session = await requirePermission("view_dashboard");

  return <DashboardOverview session={session} />;
}

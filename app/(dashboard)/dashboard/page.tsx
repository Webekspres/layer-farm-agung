import { Suspense } from "react";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardExecutive } from "@/features/dashboard/services/get-dashboard-executive";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { getActiveTenantId } from "@/features/auth/lib/session";
import {
  DashboardScopeError,
  listDashboardCageOptions,
  parseDashboardContextRequest,
  resolveDashboardCageScope,
} from "@/features/dashboard/lib/resolve-dashboard-cage-scope";
import { startOfTodayBusiness } from "@/lib/business-date";

type DashboardPageProps = {
  searchParams: Promise<{ cageId?: string | string[] }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await requirePermission("view_dashboard");
  const tenantId = getActiveTenantId(session);
  const params = await searchParams;
  const rawCageId = Array.isArray(params.cageId)
    ? params.cageId[0]
    : params.cageId;
  const requested = parseDashboardContextRequest(rawCageId);

  if (!tenantId) {
    return <DashboardOverview session={session} data={null} />;
  }

  const roleName = session.user.roleName ?? "";
  const cageOptions = await listDashboardCageOptions(
    tenantId,
    session.user.id,
    roleName,
  );

  let selectedCageId: string | null = null;
  let scopeError: string | null = null;
  let cageIds: string[] = cageOptions.map((c) => c.id);

  try {
    const scope = await resolveDashboardCageScope({
      tenantId,
      userId: session.user.id,
      roleName,
      requested,
    });
    cageIds = scope.cageIds;
    selectedCageId = scope.kind === "cage" ? scope.cageIds[0]! : null;
  } catch (error) {
    if (error instanceof DashboardScopeError) {
      scopeError = error.message;
      // Fall back to authorized "all" so the page still loads.
      cageIds = cageOptions.map((c) => c.id);
      selectedCageId = null;
    } else {
      throw error;
    }
  }

  const data = await getDashboardExecutive(
    tenantId,
    startOfTodayBusiness(),
    cageIds,
  );

  return (
    <Suspense fallback={null}>
      <DashboardOverview
        session={session}
        data={data}
        cageOptions={cageOptions}
        selectedCageId={selectedCageId}
        scopeError={scopeError}
      />
    </Suspense>
  );
}

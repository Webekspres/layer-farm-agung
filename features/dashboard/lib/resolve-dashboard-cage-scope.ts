import { getAssignedCageIdsForUser } from "@/features/cages/lib/cage-staff-db";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import prisma from "@/lib/prisma";

export type DashboardContextRequest =
  | { kind: "all" }
  | { kind: "cage"; cageId: string };

export type DashboardCageOption = {
  id: string;
  name: string;
};

export type DashboardCageScope = {
  kind: "all" | "cage";
  cageIds: string[];
  cages: DashboardCageOption[];
};

export class DashboardScopeError extends Error {
  readonly code: "unauthorized_cage";

  constructor(message: string) {
    super(message);
    this.name = "DashboardScopeError";
    this.code = "unauthorized_cage";
  }
}

type ScopeDeps = {
  prisma: typeof prisma;
  getAssignedCageIdsForUser: typeof getAssignedCageIdsForUser;
};

const defaultDeps: ScopeDeps = {
  prisma,
  getAssignedCageIdsForUser,
};

/**
 * Candidate cages for dashboard context:
 * - staff → currently assigned ∩ Active ∩ Active cycle
 * - admin/management → all Active + Active cycle in tenant
 */
export async function listDashboardCageOptions(
  tenantId: string,
  userId: string,
  roleName: string,
  deps: ScopeDeps = defaultDeps,
): Promise<DashboardCageOption[]> {
  const isStaff = roleName === STAFF_ROLE_NAME;
  const assignedIds = isStaff
    ? await deps.getAssignedCageIdsForUser(userId)
    : null;

  if (isStaff && (!assignedIds || assignedIds.length === 0)) {
    return [];
  }

  const cages = await deps.prisma.cage.findMany({
    where: {
      status: "Active",
      location: { tenant_id: tenantId },
      cycle_settings: { some: { status: "Active" } },
      ...(assignedIds ? { id: { in: assignedIds } } : {}),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return cages;
}

/**
 * Resolve which cage IDs a dashboard query may use.
 * Never trusts a raw cageId without membership in the candidate set.
 */
export async function resolveDashboardCageScope(
  input: {
    tenantId: string;
    userId: string;
    roleName: string;
    requested: DashboardContextRequest;
  },
  deps: ScopeDeps = defaultDeps,
): Promise<DashboardCageScope> {
  const cages = await listDashboardCageOptions(
    input.tenantId,
    input.userId,
    input.roleName,
    deps,
  );
  const cageIds = cages.map((c) => c.id);

  if (input.requested.kind === "all") {
    return { kind: "all", cageIds, cages };
  }

  const requestedCageId = input.requested.cageId;
  const allowed = new Set(cageIds);
  if (!allowed.has(requestedCageId)) {
    throw new DashboardScopeError(
      "Kandang tidak diizinkan untuk konteks dasbor Anda.",
    );
  }

  const selected = cages.filter((c) => c.id === requestedCageId);
  return {
    kind: "cage",
    cageIds: [requestedCageId],
    cages: selected,
  };
}

export function parseDashboardContextRequest(
  cageId: string | null | undefined,
): DashboardContextRequest {
  if (cageId && cageId.trim().length > 0) {
    return { kind: "cage", cageId: cageId.trim() };
  }
  return { kind: "all" };
}

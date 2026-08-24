import { describe, expect, test } from "bun:test";
import {
  DashboardScopeError,
  listDashboardCageOptions,
  parseDashboardContextRequest,
  resolveDashboardCageScope,
} from "@/features/dashboard/lib/resolve-dashboard-cage-scope";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";

function makeDeps(opts: {
  assigned?: string[];
  cages?: { id: string; name: string }[];
}) {
  const cages = opts.cages ?? [
    { id: "L1", name: "Kandang L1" },
    { id: "L2", name: "Kandang L2" },
    { id: "L3", name: "Kandang L3" },
  ];
  const assigned = opts.assigned ?? ["L1", "L3"];

  return {
    prisma: {
      cage: {
        findMany: async ({
          where,
        }: {
          where: { id?: { in: string[] } };
        }) => {
          const filter = where.id?.in;
          if (!filter) return cages;
          return cages.filter((c) => filter.includes(c.id));
        },
      },
    },
    getAssignedCageIdsForUser: async () => assigned,
  } as unknown as Parameters<typeof resolveDashboardCageScope>[1];
}

describe("parseDashboardContextRequest", () => {
  test("empty → all", () => {
    expect(parseDashboardContextRequest(undefined)).toEqual({ kind: "all" });
    expect(parseDashboardContextRequest(null)).toEqual({ kind: "all" });
    expect(parseDashboardContextRequest("")).toEqual({ kind: "all" });
  });

  test("cageId → cage", () => {
    expect(parseDashboardContextRequest("L1")).toEqual({
      kind: "cage",
      cageId: "L1",
    });
  });
});

describe("listDashboardCageOptions", () => {
  test("staff only sees currently assigned cages", async () => {
    const deps = makeDeps({ assigned: ["L1", "L3"] });
    const options = await listDashboardCageOptions(
      "tenant-1",
      "staff-1",
      STAFF_ROLE_NAME,
      deps,
    );
    expect(options.map((c) => c.id)).toEqual(["L1", "L3"]);
  });

  test("after revoke, assigned set shrinks (L2 gone)", async () => {
    const deps = makeDeps({ assigned: ["L1"] });
    const options = await listDashboardCageOptions(
      "tenant-1",
      "staff-1",
      STAFF_ROLE_NAME,
      deps,
    );
    expect(options.map((c) => c.id)).toEqual(["L1"]);
  });

  test("admin sees all active cages in tenant", async () => {
    const deps = makeDeps({ assigned: [] });
    const options = await listDashboardCageOptions(
      "tenant-1",
      "admin-1",
      "admin",
      deps,
    );
    expect(options.map((c) => c.id)).toEqual(["L1", "L2", "L3"]);
  });
});

describe("resolveDashboardCageScope", () => {
  test("staff all → only assigned ids", async () => {
    const deps = makeDeps({ assigned: ["L1", "L3"] });
    const scope = await resolveDashboardCageScope(
      {
        tenantId: "tenant-1",
        userId: "staff-1",
        roleName: STAFF_ROLE_NAME,
        requested: { kind: "all" },
      },
      deps,
    );
    expect(scope.kind).toBe("all");
    expect(scope.cageIds).toEqual(["L1", "L3"]);
  });

  test("staff cage L1 → single cage", async () => {
    const deps = makeDeps({ assigned: ["L1", "L3"] });
    const scope = await resolveDashboardCageScope(
      {
        tenantId: "tenant-1",
        userId: "staff-1",
        roleName: STAFF_ROLE_NAME,
        requested: { kind: "cage", cageId: "L1" },
      },
      deps,
    );
    expect(scope).toEqual({
      kind: "cage",
      cageIds: ["L1"],
      cages: [{ id: "L1", name: "Kandang L1" }],
    });
  });

  test("staff unauthorized cage L2 → error", async () => {
    const deps = makeDeps({ assigned: ["L1", "L3"] });
    await expect(
      resolveDashboardCageScope(
        {
          tenantId: "tenant-1",
          userId: "staff-1",
          roleName: STAFF_ROLE_NAME,
          requested: { kind: "cage", cageId: "L2" },
        },
        deps,
      ),
    ).rejects.toBeInstanceOf(DashboardScopeError);
  });

  test("admin cage filter → single cage", async () => {
    const deps = makeDeps({});
    const scope = await resolveDashboardCageScope(
      {
        tenantId: "tenant-1",
        userId: "admin-1",
        roleName: "admin",
        requested: { kind: "cage", cageId: "L2" },
      },
      deps,
    );
    expect(scope.cageIds).toEqual(["L2"]);
  });
});

import { describe, expect, test } from "bun:test";
import {
  adminNavItems,
  filterNavByPermissions,
  mainNavItems,
  masterDataNavItems,
} from "@/features/dashboard/config/navigation";

describe("filterNavByPermissions", () => {
  test("hides finance for user without view_cashflow", () => {
    const filtered = filterNavByPermissions(
      mainNavItems,
      ["view_dashboard", "manage_production"],
      false,
    );
    const hrefs = filtered.map((item) => item.href);
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).not.toContain("/dashboard/finance");
  });

  test("hides global-only tenant nav for branch admin", () => {
    const filtered = filterNavByPermissions(
      adminNavItems,
      ["manage_users", "manage_roles"],
      false,
    );
    const hrefs = filtered.map((item) => item.href);
    expect(hrefs).toContain("/dashboard/users");
    expect(hrefs).not.toContain("/dashboard/tenants");
  });

  test("shows tenant nav for global superadmin", () => {
    const filtered = filterNavByPermissions(
      adminNavItems,
      ["manage_roles"],
      true,
    );
    expect(filtered.some((item) => item.href === "/dashboard/tenants")).toBe(
      true,
    );
  });

  test("hides admin items when manage_users is missing", () => {
    const filtered = filterNavByPermissions(adminNavItems, [], false);
    expect(filtered).toHaveLength(0);
  });

  test("tenant admin sees tenant master data only", () => {
    const filtered = filterNavByPermissions(
      masterDataNavItems,
      ["manage_master_data"],
      false,
    );
    const hrefs = filtered.map((item) => item.href);
    expect(hrefs).toContain("/dashboard/locations");
    expect(hrefs).toContain("/dashboard/cages");
    expect(hrefs).toContain("/dashboard/vendors");
    expect(hrefs).not.toContain("/dashboard/strains");
    expect(hrefs).not.toContain("/dashboard/egg-grades");
  });

  test("superadmin sees global catalog in master data nav", () => {
    const filtered = filterNavByPermissions(
      masterDataNavItems,
      ["manage_global_catalog"],
      true,
    );
    const hrefs = filtered.map((item) => item.href);
    expect(hrefs).toContain("/dashboard/strains");
    expect(hrefs).toContain("/dashboard/egg-grades");
  });

  test("hides master data nav for staff without permission", () => {
    const filtered = filterNavByPermissions(
      masterDataNavItems,
      ["manage_production", "manage_inventory"],
      false,
    );
    expect(filtered).toHaveLength(0);
  });
});

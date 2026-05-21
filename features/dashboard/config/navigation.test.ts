import { describe, expect, test } from "bun:test";
import {
  adminNavItems,
  filterNavByPermissions,
  mainNavItems,
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

  test("hides global-only cabang nav for branch admin", () => {
    const filtered = filterNavByPermissions(
      adminNavItems,
      ["manage_users", "manage_roles"],
      false,
    );
    const hrefs = filtered.map((item) => item.href);
    expect(hrefs).toContain("/dashboard/users");
    expect(hrefs).not.toContain("/dashboard/branches");
  });

  test("shows cabang nav for global superadmin", () => {
    const filtered = filterNavByPermissions(
      adminNavItems,
      ["manage_roles"],
      true,
    );
    expect(filtered.some((item) => item.href === "/dashboard/branches")).toBe(
      true,
    );
  });

  test("hides admin items when manage_users is missing", () => {
    const filtered = filterNavByPermissions(adminNavItems, [], false);
    expect(filtered).toHaveLength(0);
  });
});

import { describe, expect, test } from "bun:test";
import {
  ADMIN_ROLE_NAME,
  defaultPermissionIdsForRole,
  getDefaultPermissionNamesForRole,
  resolveRolePermissionNames,
  sortRolesBySystemOrder,
  STAFF_ROLE_NAME,
  SUPERADMIN_ROLE_NAME,
  SYSTEM_ROLES,
} from "./system-roles";

describe("system-roles", () => {
  test("defines all three canonical roles", () => {
    expect(Object.keys(SYSTEM_ROLES).sort()).toEqual(
      [ADMIN_ROLE_NAME, STAFF_ROLE_NAME, SUPERADMIN_ROLE_NAME].sort(),
    );
  });

  test("staff has operational permissions only", () => {
    const staff = resolveRolePermissionNames(SYSTEM_ROLES[STAFF_ROLE_NAME]);
    expect(staff).toEqual([
      "view_dashboard",
      "manage_production",
      "manage_inventory",
    ]);
    expect(staff).not.toContain("manage_users");
    expect(staff).not.toContain("manage_roles");
  });

  test("admin excludes manage_roles", () => {
    const admin = resolveRolePermissionNames(SYSTEM_ROLES[ADMIN_ROLE_NAME]);
    expect(admin).not.toContain("manage_roles");
    expect(admin).toContain("manage_users");
  });

  test("defaultPermissionIdsForRole maps names to ids", () => {
    const permissions = [
      { id: 1, name: "view_dashboard" },
      { id: 2, name: "manage_roles" },
      { id: 3, name: "manage_production" },
    ];
    const staffIds = defaultPermissionIdsForRole(STAFF_ROLE_NAME, permissions);
    expect(staffIds).toEqual([1, 3]);
    expect(getDefaultPermissionNamesForRole("custom")).toBeNull();
  });

  test("sortRolesBySystemOrder lists superadmin, admin, staff", () => {
    const sorted = sortRolesBySystemOrder([
      { name: STAFF_ROLE_NAME },
      { name: SUPERADMIN_ROLE_NAME },
      { name: ADMIN_ROLE_NAME },
      { name: "custom" },
    ]);
    expect(sorted.map((r) => r.name)).toEqual([
      SUPERADMIN_ROLE_NAME,
      ADMIN_ROLE_NAME,
      STAFF_ROLE_NAME,
      "custom",
    ]);
  });
});

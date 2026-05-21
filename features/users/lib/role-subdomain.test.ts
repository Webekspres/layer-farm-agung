import { describe, expect, test } from "bun:test";
import {
  isSuperadminRole,
  subdomainIdAfterRoleChange,
  SUPERADMIN_ROLE_NAME,
} from "@/features/users/lib/role-subdomain";

const roles = [
  { id: 1, name: SUPERADMIN_ROLE_NAME },
  { id: 2, name: "admin" },
  { id: 3, name: "staff" },
];

const branches = [{ id: "branch-a" }, { id: "branch-b" }];

describe("isSuperadminRole", () => {
  test("detects superadmin role id", () => {
    expect(isSuperadminRole("1", roles)).toBe(true);
    expect(isSuperadminRole("2", roles)).toBe(false);
  });
});

describe("subdomainIdAfterRoleChange", () => {
  test("forces global for superadmin", () => {
    expect(subdomainIdAfterRoleChange("1", "branch-a", roles, branches)).toBe(
      "global",
    );
  });

  test("clears global when switching to admin", () => {
    expect(
      subdomainIdAfterRoleChange("2", "global", roles, branches, "branch-b"),
    ).toBe("branch-b");
  });

  test("keeps branch when switching between non-superadmin roles", () => {
    expect(subdomainIdAfterRoleChange("3", "branch-a", roles, branches)).toBe(
      "branch-a",
    );
  });
});

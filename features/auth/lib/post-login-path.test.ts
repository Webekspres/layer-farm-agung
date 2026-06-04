import { describe, expect, test } from "bun:test";
import {
  getPostLoginPath,
  isStaffRole,
} from "@/features/auth/lib/post-login-path";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";

describe("post-login-path", () => {
  test("staff lands on kandang", () => {
    expect(getPostLoginPath(STAFF_ROLE_NAME)).toBe("/kandang");
    expect(isStaffRole(STAFF_ROLE_NAME)).toBe(true);
  });

  test("admin lands on dashboard", () => {
    expect(getPostLoginPath("admin")).toBe("/dashboard");
    expect(isStaffRole("admin")).toBe(false);
  });
});

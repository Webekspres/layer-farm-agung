import { describe, expect, test } from "bun:test";
import {
  changeOwnPasswordSchema,
  createUserSchema,
  deleteUserSchema,
  resetUserPasswordSchema,
} from "@/features/users/schemas/user";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("createUserSchema", () => {
  test("accepts valid payload with global tenant", () => {
    const result = createUserSchema.safeParse({
      fullName: "Staff Baru",
      username: "staff.baru",
      email: "",
      password: "ChangeMe123!",
      roleId: "2",
      tenantId: "global",
      isActive: "true",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid username characters", () => {
    const result = createUserSchema.safeParse({
      fullName: "Staff Baru",
      username: "bad user!",
      password: "ChangeMe123!",
      roleId: 2,
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 8 characters", () => {
    const result = createUserSchema.safeParse({
      fullName: "Staff Baru",
      username: "staff",
      password: "short",
      roleId: 2,
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteUserSchema", () => {
  test("accepts valid user id", () => {
    const result = deleteUserSchema.safeParse({ userId: validUuid });
    expect(result.success).toBe(true);
  });

  test("rejects non-uuid user id", () => {
    const result = deleteUserSchema.safeParse({ userId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("resetUserPasswordSchema", () => {
  test("requires minimum password length", () => {
    const result = resetUserPasswordSchema.safeParse({
      userId: validUuid,
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });
});

describe("changeOwnPasswordSchema", () => {
  test("rejects when confirm password does not match", () => {
    const result = changeOwnPasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Konfirmasi password tidak cocok.",
      );
    }
  });

  test("accepts matching new and confirm passwords", () => {
    const result = changeOwnPasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });
});

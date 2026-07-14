import { describe, expect, test } from "bun:test";
import { tenantSchema } from "@/features/tenants/schemas/tenant";

describe("tenantSchema", () => {
  test("accepts valid tenant slug", () => {
    const result = tenantSchema.safeParse({
      name: "Tenant Utama",
      slug: "tenant-utama",
      isActive: "true",
    });
    expect(result.success).toBe(true);
  });

  test("rejects uppercase or spaces in slug", () => {
    const result = tenantSchema.safeParse({
      name: "Tenant Baru",
      slug: "Tenant Baru",
    });
    expect(result.success).toBe(false);
  });
});

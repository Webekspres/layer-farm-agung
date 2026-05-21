import { describe, expect, test } from "bun:test";
import { subdomainSchema } from "@/features/subdomains/schemas/subdomain";

describe("subdomainSchema", () => {
  test("accepts valid cabang slug", () => {
    const result = subdomainSchema.safeParse({
      name: "Cabang Utama",
      subdomainUrl: "cabang-utama",
      isActive: "true",
    });
    expect(result.success).toBe(true);
  });

  test("rejects uppercase or spaces in subdomain URL", () => {
    const result = subdomainSchema.safeParse({
      name: "Cabang Baru",
      subdomainUrl: "Cabang Baru",
    });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, test } from "bun:test";
import { createPermissionSchema } from "@/features/permissions/schemas/permission";

describe("createPermissionSchema", () => {
  test("accepts valid snake_case name", () => {
    const result = createPermissionSchema.safeParse({ name: "manage_feed" });
    expect(result.success).toBe(true);
  });

  test("rejects uppercase names", () => {
    const result = createPermissionSchema.safeParse({ name: "Manage_Feed" });
    expect(result.success).toBe(false);
  });
});

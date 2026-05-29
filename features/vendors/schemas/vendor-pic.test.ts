import { describe, expect, test } from "bun:test";
import { vendorSchema } from "@/features/vendors/schemas/vendor";

describe("vendorSchema PIC refinement", () => {
  test("accepts vendor with full PIC details", () => {
    const result = vendorSchema.safeParse({
      name: "Pakan Jaya",
      category: "Pakan",
      picName: "Pak Budi",
      picPhone: "081234567890",
    });
    expect(result.success).toBe(true);
  });

  test("accepts vendor without PIC details", () => {
    const result = vendorSchema.safeParse({
      name: "Pakan Jaya",
      category: "Pakan",
    });
    expect(result.success).toBe(true);
  });

  test("rejects PIC name without a phone number", () => {
    const result = vendorSchema.safeParse({
      name: "Pakan Jaya",
      category: "Pakan",
      picName: "Pak Budi",
    });
    expect(result.success).toBe(false);
  });
});

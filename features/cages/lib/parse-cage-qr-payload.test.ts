import { describe, expect, test } from "bun:test";

import { parseCageQrPayload } from "@/features/cages/lib/parse-cage-qr-payload";

describe("parseCageQrPayload", () => {
  test("parses aapmmobile deep link", () => {
    expect(
      parseCageQrPayload("aapmmobile://kandang/KDG4F8A2B1C0D3/produksi"),
    ).toBe("KDG4F8A2B1C0D3");
  });

  test("parses legacy aapm scheme", () => {
    expect(parseCageQrPayload("aapm://kandang/KDGABC/produksi")).toBe("KDGABC");
  });

  test("accepts bare qr token", () => {
    expect(parseCageQrPayload("KDG4F8A2B1C0D3")).toBe("KDG4F8A2B1C0D3");
  });

  test("accepts bare uuid", () => {
    const id = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    expect(parseCageQrPayload(id)).toBe(id);
  });

  test("returns null for invalid payload", () => {
    expect(parseCageQrPayload("not-a-qr")).toBeNull();
  });
});

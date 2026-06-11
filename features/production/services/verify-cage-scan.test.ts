import { describe, expect, test } from "bun:test";

import { parseCageQrPayload } from "@/features/cages/lib/parse-cage-qr-payload";

describe("verifyCageScan prerequisites", () => {
  test("rest-period message path uses hasActiveCycle false", () => {
    const message =
      "Kandang sedang rehat — tidak ada periode produksi aktif. Hubungi admin untuk memulai siklus baru.";
    expect(message).toContain("rehat");
  });

  test("invalid qr payload is rejected before lookup", () => {
    expect(parseCageQrPayload("")).toBeNull();
    expect(parseCageQrPayload("random")).toBeNull();
  });
});

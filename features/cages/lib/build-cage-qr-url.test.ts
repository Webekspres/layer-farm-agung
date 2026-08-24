import { describe, expect, test } from "bun:test";

import { buildCageQrUrl } from "@/features/cages/lib/build-cage-qr-url";
import { parseCageQrPayload } from "@/features/cages/lib/parse-cage-qr-payload";

describe("buildCageQrUrl", () => {
  test("encodes stable qr_code deep link for mobile scan", () => {
    const url = buildCageQrUrl("KDG4F8A2B1C0D3");
    expect(url).toBe("aapmmobile://kandang/KDG4F8A2B1C0D3/produksi");
    expect(parseCageQrPayload(url)).toBe("KDG4F8A2B1C0D3");
  });
});

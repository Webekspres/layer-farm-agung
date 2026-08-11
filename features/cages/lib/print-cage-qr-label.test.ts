import { describe, expect, test } from "bun:test";

import { buildCageQrPrintDocumentHtml } from "@/features/cages/lib/print-cage-qr-label";

describe("buildCageQrPrintDocumentHtml", () => {
  test("escapes cage name and embeds svg", () => {
    const html = buildCageQrPrintDocumentHtml({
      cageName: `Kandang <1> & "A"`,
      qrCode: "KDGABC",
      qrSvgHtml: "<svg></svg>",
    });
    expect(html).toContain("Kandang &lt;1&gt; &amp; &quot;A&quot;");
    expect(html).toContain("KDGABC");
    expect(html).toContain("<svg></svg>");
    expect(html).not.toContain("Kandang <1>");
  });
});

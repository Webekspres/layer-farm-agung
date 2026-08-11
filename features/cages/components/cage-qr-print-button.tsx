"use client";

import { useRef, type ComponentProps } from "react";
import { QrCode } from "lucide-react";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { buildCageQrUrl } from "@/features/cages/lib/build-cage-qr-url";
import {
  buildCageQrPrintDocumentHtml,
  printHtmlViaHiddenIframe,
} from "@/features/cages/lib/print-cage-qr-label";
import { cn } from "@/lib/utils";

type CageQrPrintButtonProps = {
  cageName: string;
  qrCode: string;
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  iconOnly?: boolean;
};

export function CageQrPrintButton({
  cageName,
  qrCode,
  label = "Cetak QR Kandang",
  variant = "default",
  size = "default",
  className,
  iconOnly = false,
}: CageQrPrintButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const qrUrl = buildCageQrUrl(qrCode);

  function handlePrint() {
    if (!qrCode) return;

    const svg = hostRef.current?.querySelector("svg");
    if (!svg) return;

    const html = buildCageQrPrintDocumentHtml({
      cageName,
      qrCode,
      qrSvgHtml: svg.outerHTML,
    });
    printHtmlViaHiddenIframe(html);
  }

  return (
    <>
      <div
        ref={hostRef}
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      >
        <QRCode value={qrUrl} size={200} />
      </div>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={handlePrint}
        disabled={!qrCode}
        title={label}
      >
        {iconOnly ? (
          <>
            <QrCode className="size-4" />
            <span className="sr-only">{label}</span>
          </>
        ) : (
          label
        )}
      </Button>
    </>
  );
}

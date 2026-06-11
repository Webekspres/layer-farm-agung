"use client";

import QRCode from "react-qr-code";

import { buildCageQrUrl } from "@/features/cages/lib/build-cage-qr-url";

type CageQrPanelProps = {
  cageName: string;
  qrCode: string;
};

export function CageQrPanel({ cageName, qrCode }: CageQrPanelProps) {
  const qrUrl = buildCageQrUrl(qrCode);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-bold tracking-tight text-foreground">
        QR Kandang
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Tempel di pintu <span className="font-medium text-foreground">{cageName}</span>.
        Staff scan untuk input produksi harian.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl border border-border bg-white p-4">
          <QRCode value={qrUrl} size={160} />
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Kode:</span>{" "}
            <span className="font-mono font-semibold text-foreground">{qrCode}</span>
          </div>
          <div className="break-all text-muted-foreground">
            <span className="text-muted-foreground">URL:</span>{" "}
            <span className="font-mono text-xs text-foreground">{qrUrl}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

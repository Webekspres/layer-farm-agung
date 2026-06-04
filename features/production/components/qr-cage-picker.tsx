"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Layers,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldCageListItem } from "@/features/production/services/list-field-cages";

type QrCagePickerProps = {
  cages: FieldCageListItem[];
};

type ScannedCage = FieldCageListItem;

export function QrCagePicker({ cages }: QrCagePickerProps) {
  const router = useRouter();
  const [scanned, setScanned] = useState<ScannedCage | null>(null);
  const [manualId, setManualId] = useState<string>("");
  const [showManual, setShowManual] = useState(false);

  function handleSimulateScan() {
    // In production this would open the device camera via a library such as
    // html5-qrcode or jsQR. For now we pick a random pending cage as demo.
    const pending = cages.filter((c) => !c.recordedToday);
    const candidate = pending[0] ?? cages[0];
    if (candidate) setScanned(candidate);
  }

  function handleManualSelect(id: string) {
    const cage = cages.find((c) => c.id === id);
    if (cage) {
      setManualId(id);
      setScanned(cage);
    }
  }

  function handleStart() {
    if (scanned) {
      router.push(`/kandang/${scanned.id}/produksi`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Scanner viewport */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a2a1a]">
        <div className="flex aspect-square w-full items-center justify-center">
          {/* Corner markers */}
          <div className="relative flex h-52 w-52 items-center justify-center">
            <span className="absolute top-0 left-0 size-8 rounded-tl-md border-t-4 border-l-4 border-primary" />
            <span className="absolute top-0 right-0 size-8 rounded-tr-md border-t-4 border-r-4 border-primary" />
            <span className="absolute bottom-0 left-0 size-8 rounded-bl-md border-b-4 border-l-4 border-primary" />
            <span className="absolute bottom-0 right-0 size-8 rounded-br-md border-b-4 border-r-4 border-primary" />

            {/* Scan line */}
            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 bg-primary/70 shadow-[0_0_8px_theme(colors.primary/DEFAULT)]" />

            <QrCode className="size-16 text-muted-foreground/30" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateScan}
          className="absolute inset-0 flex items-end justify-center pb-5"
          aria-label="Simulasikan scan QR"
        >
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/70">
            Ketuk untuk mensimulasikan scan
          </span>
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Arahkan kamera pada QR Code yang tertempel di depan pintu kandang untuk
        memulai pencatatan harian.
      </p>

      {/* Manual picker toggle */}
      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-2"
      >
        Pilih ID Kandang Manual
        <ChevronDown
          className={`size-4 transition-transform ${showManual ? "rotate-180" : ""}`}
        />
      </button>

      {showManual && (
        <Select value={manualId} onValueChange={handleManualSelect}>
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="Pilih kandang…" />
          </SelectTrigger>
          <SelectContent>
            {cages.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} — {c.locationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Scan result card */}
      {scanned && (
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Check className="size-3.5" />
            QR Code Berhasil Dipindai
          </p>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{scanned.name}</p>
              <p className="text-xs text-muted-foreground">
                Tipe: {scanned.cageType ?? "—"} · Kapasitas:{" "}
                {scanned.capacity.toLocaleString("id-ID")} ekor
              </p>
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="mt-4 min-h-11 w-full text-sm font-semibold"
          >
            Mulai Pencatatan Kandang Ini
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Loader2, Play, CheckCircle2, History, AlertCircle } from "lucide-react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createCycleAction } from "@/features/cages/actions/create-cycle";
import { closeCycleAction } from "@/features/cages/actions/close-cycle";
import type { CageDetail } from "@/features/cages/services/get-cage-detail";

function getAgeInWeeksAndDays(startDate: Date) {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.max(0, today.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  return `${weeks} Minggu${days > 0 ? ` ${days} Hari` : ""}`;
}

function getDurationInWeeksAndDays(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  return `${weeks} Minggu${days > 0 ? ` ${days} Hari` : ""}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type CageDetailViewProps = {
  cage: CageDetail;
};

export function CageDetailView({ cage }: CageDetailViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const [createState, createAction, createPending] = useActionState(
    createCycleAction,
    {},
  );
  const [closeState, closeAction, closePending] = useActionState(
    closeCycleAction,
    {},
  );

  useActionFeedback(createState, {
    successMessage: "Siklus baru berhasil dimulai!",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(closeState, {
    successMessage: "Siklus berjalan berhasil ditutup. Kandang sekarang kosong.",
    onSuccess: () => setCloseOpen(false),
    when: closeOpen,
  });

  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          href="/dashboard/cages"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Kandang
        </Link>
      </div>

      {/* Cage Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{cage.name}</h1>
              <Badge variant={cage.status === "Active" ? "default" : "secondary"}>
                {cage.status === "Active" ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {cage.location.name} • {cage.strain.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm border-t border-border pt-4 sm:border-0 sm:pt-0">
            <div className="space-y-0.5">
              <span className="text-muted-foreground block text-xs">Kapasitas Maksimal</span>
              <span className="font-semibold text-foreground">{cage.capacity.toLocaleString("id-ID")} Ekor</span>
            </div>
            {cage.cageType && (
              <div className="space-y-0.5 border-l border-border pl-4">
                <span className="text-muted-foreground block text-xs">Tipe Kandang</span>
                <span className="font-semibold text-foreground">{cage.cageType}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Cycle Panel */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground">
          <Play className="size-5 text-emerald-500 fill-emerald-500/25" />
          Siklus Berjalan (Aktif)
        </h2>

        {cage.activeCycle ? (
          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Calendar className="size-4" />
                  Tanggal Mulai
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatDate(cage.activeCycle.startDate)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <History className="size-4" />
                  Umur Siklus
                </div>
                <p className="text-lg font-bold text-foreground">
                  {getAgeInWeeksAndDays(cage.activeCycle.startDate)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Users className="size-4" />
                  Populasi Awal
                </div>
                <p className="text-lg font-bold text-foreground">
                  {cage.activeCycle.initialPopulation.toLocaleString("id-ID")} Ekor
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setCloseOpen(true)}
              >
                Tutup Siklus / Afkir Kandang
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <AlertCircle className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Kandang Kosong</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Tidak ada siklus aktif yang berjalan di kandang ini. Silakan mulai siklus baru untuk mulai mencatat produksi.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              onClick={() => setCreateOpen(true)}
            >
              Mulai Siklus Baru
            </Button>
          </div>
        )}
      </div>

      {/* Cycle History Ledger */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground">
          <CheckCircle2 className="size-5 text-muted-foreground" />
          Riwayat Siklus
        </h2>

        {cage.history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Belum ada riwayat siklus untuk kandang ini.
          </p>
        ) : (
          <Table containerClassName="overflow-x-auto border border-border rounded-lg">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Periode Siklus</TableHead>
                <TableHead>Populasi Awal</TableHead>
                <TableHead className="text-right">Durasi Siklus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cage.history.map((h) => (
                <TableRow key={h.id} className="hover:bg-muted/10">
                  <TableCell className="font-medium text-foreground">
                    {formatDate(h.startDate)} — {h.endDate ? formatDate(h.endDate) : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {h.initialPopulation.toLocaleString("id-ID")} Ekor
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {h.endDate ? getDurationInWeeksAndDays(h.startDate, h.endDate) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Start Cycle Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mulai Siklus Baru</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <input type="hidden" name="cageId" value={cage.id} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="start-date">Tanggal Mulai</FieldLabel>
                <Input
                  id="start-date"
                  name="startDate"
                  type="date"
                  max={todayString}
                  defaultValue={todayString}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="initial-population">
                  Populasi Awal (Maksimal {cage.capacity.toLocaleString("id-ID")} Ekor)
                </FieldLabel>
                <Input
                  id="initial-population"
                  name="initialPopulation"
                  type="number"
                  min={1}
                  max={cage.capacity}
                  required
                  placeholder="Masukkan populasi awal..."
                />
              </Field>
              {createState.error ? <FieldError>{createState.error}</FieldError> : null}
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                disabled={createPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={createPending}
              >
                {createPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Mulai Siklus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Cycle Dialog */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tutup Siklus / Afkir Kandang</DialogTitle>
          </DialogHeader>
          {cage.activeCycle ? (
            <form action={closeAction}>
              <input type="hidden" name="cycleId" value={cage.activeCycle.id} />
              <FieldGroup>
                <p className="text-sm text-muted-foreground mb-2">
                  Apakah Anda yakin ingin menutup siklus aktif ini? Tindakan ini akan mengarsipkan siklus dan mencatat tanggal penyelesaian.
                </p>
                <Field>
                  <FieldLabel htmlFor="end-date">Tanggal Selesai</FieldLabel>
                  <Input
                    id="end-date"
                    name="endDate"
                    type="date"
                    min={new Date(cage.activeCycle.startDate).toISOString().split("T")[0]}
                    max={todayString}
                    defaultValue={todayString}
                    required
                  />
                </Field>
                {closeState.error ? <FieldError>{closeState.error}</FieldError> : null}
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCloseOpen(false)}
                  disabled={closePending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={closePending}
                >
                  {closePending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Tutup Siklus
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

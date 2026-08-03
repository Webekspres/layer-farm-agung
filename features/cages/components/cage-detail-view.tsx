"use client";

import { useActionState, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  Loader2,
  Play,
  CheckCircle2,
  History,
  AlertCircle,
  Egg,
  TrendingUp,
  Package,
  HeartPulse,
  Activity,
  Syringe,
} from "lucide-react";
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
import { regenerateVaccineSchedulesForCageAction } from "@/features/health/actions/regenerate-vaccine-schedules-for-cage";
import {
  formatBusinessDate,
  formatBusinessDateFromDb,
  startOfTodayBusiness,
} from "@/lib/business-date";
import { CageQrPanel } from "@/features/cages/components/cage-qr-panel";
import { CageStaffPanel } from "@/features/cages/components/cage-staff-panel";
import type { CageDetail } from "@/features/cages/services/get-cage-detail";
import type { CycleOperationalSummary } from "@/features/cages/services/get-cycle-operational-summary";
import { formatHdpPercent } from "@/features/production/lib/compute-hdp";
import type { TenantStaffOption } from "@/features/cages/services/list-tenant-staff-options";
import { cn } from "@/lib/utils";

function formatCount(value: number) {
  return value.toLocaleString("id-ID");
}

function formatCycleAge(summary: Pick<CycleOperationalSummary, "ageWeeks" | "ageDaysRemainder">) {
  const { ageWeeks, ageDaysRemainder } = summary;
  return `${ageWeeks} Minggu${ageDaysRemainder > 0 ? ` ${ageDaysRemainder} Hari` : ""}`;
}

function formatFcr(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(2);
}

function formatPercent(value: number | null) {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

function formatMutationSummary(summary: CycleOperationalSummary) {
  const { initialPopulation, currentPopulation, mutations } = summary;
  const loss = mutations.mati + mutations.afkir;
  const parts = [`Awal ${formatCount(initialPopulation)}`];

  if (loss > 0) {
    parts.push(`−${formatCount(loss)} mati/afkir`);
  }
  if (mutations.masuk > 0) {
    parts.push(`+${formatCount(mutations.masuk)} masuk`);
  }
  if (mutations.pindah > 0) {
    parts.push(`−${formatCount(mutations.pindah)} pindah`);
  }

  parts.push(`→ ${formatCount(currentPopulation)}`);
  return parts.join(" ");
}

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  valueClassName?: string;
};

function MetricCard({ label, value, description, icon: Icon, valueClassName }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-emerald-500/15 bg-background/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className={cn("text-lg font-bold text-foreground", valueClassName)}>{value}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

type CageDetailViewProps = {
  cage: CageDetail;
  staffOptions: TenantStaffOption[];
};

export function CageDetailView({ cage, staffOptions }: CageDetailViewProps) {
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
  const [regenState, regenAction, regenPending] = useActionState(
    regenerateVaccineSchedulesForCageAction,
    {},
  );

  useActionFeedback(createState, {
    successMessage: createState.message
      ? `Siklus baru berhasil dimulai. ${createState.message}`
      : "Siklus baru berhasil dimulai!",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(closeState, {
    successMessage: "Siklus berjalan berhasil ditutup. Kandang sekarang kosong.",
    onSuccess: () => setCloseOpen(false),
    when: closeOpen,
  });

  useActionFeedback(regenState, {
    successMessage: regenState.message ?? "Jadwal vaksin berhasil digenerate.",
    when: true,
  });

  const todayString = formatBusinessDate(startOfTodayBusiness());

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

      <div className="grid gap-6 lg:grid-cols-2">
        <CageQrPanel cageName={cage.name} qrCode={cage.qrCode} />
        <CageStaffPanel
          cageId={cage.id}
          staffOptions={staffOptions}
          assignedStaffIds={cage.assignedStaffIds}
        />
      </div>

      {/* Active Cycle Panel */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 text-foreground">
          <Play className="size-5 text-emerald-500 fill-emerald-500/25" />
          Siklus Berjalan (Aktif)
        </h2>

        {cage.activeCycle ? (
          <div className="rounded-xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/5 to-teal-500/5 p-6">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Calendar className="size-4" />
                  Tanggal Mulai
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatBusinessDateFromDb(cage.activeCycle.startDate)}
                </p>
              </div>

              <MetricCard
                icon={Users}
                label="Populasi Saat Ini"
                value={`${formatCount(cage.activeCycle.summary.currentPopulation)} Ekor`}
                description={`Awal ${formatCount(cage.activeCycle.initialPopulation)} ekor`}
              />

              <MetricCard
                icon={History}
                label="Umur Siklus"
                value={formatCycleAge(cage.activeCycle.summary)}
              />

              <MetricCard
                icon={Activity}
                label="Kapasitas"
                value={formatPercent(cage.activeCycle.summary.capacityPercent)}
                description={`dari ${formatCount(cage.capacity)} ekor`}
                valueClassName={
                  (cage.activeCycle.summary.capacityPercent ?? 0) > 100
                    ? "text-destructive"
                    : undefined
                }
              />

              <MetricCard
                icon={TrendingUp}
                label="HDP Hari Ini"
                value={formatHdpPercent(cage.activeCycle.summary.production.todayHdp)}
                description={
                  cage.activeCycle.summary.production.targetHdp !== null
                    ? `Target ${formatHdpPercent(cage.activeCycle.summary.production.targetHdp)}`
                    : `TB ${formatCount(cage.activeCycle.summary.production.todayTb)} butir`
                }
                valueClassName={
                  cage.activeCycle.summary.production.todayHdp !== null &&
                  cage.activeCycle.summary.production.targetHdp !== null &&
                  cage.activeCycle.summary.production.todayHdp >=
                    cage.activeCycle.summary.production.targetHdp
                    ? "text-emerald-600 dark:text-emerald-400"
                    : cage.activeCycle.summary.production.todayHdp !== null &&
                        cage.activeCycle.summary.production.targetHdp !== null
                      ? "text-destructive"
                      : undefined
                }
              />
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Egg}
                label="Kumulatif TB"
                value={`${formatCount(cage.activeCycle.summary.production.cumulativeTb)} Butir`}
                description={`TR ${formatCount(cage.activeCycle.summary.production.cumulativeTr)} · TP ${formatCount(cage.activeCycle.summary.production.cumulativeTp)}`}
              />

              <MetricCard
                icon={Package}
                label="FCR Siklus"
                value={formatFcr(cage.activeCycle.summary.feed.fcr)}
                description={`Pakan ${formatCount(cage.activeCycle.summary.feed.totalQuantity)} kg`}
              />

              <MetricCard
                icon={Users}
                label="Mutasi"
                value={`Mati ${formatCount(cage.activeCycle.summary.mutations.mati)} · Afkir ${formatCount(cage.activeCycle.summary.mutations.afkir)}`}
                description={formatMutationSummary(cage.activeCycle.summary)}
              />

              <MetricCard
                icon={HeartPulse}
                label="Kesehatan"
                value={`${formatCount(cage.activeCycle.summary.medical.eventCount)} Kejadian`}
                description={
                  cage.activeCycle.summary.medical.mortalityTotal > 0
                    ? `Mortalitas pengobatan ${formatCount(cage.activeCycle.summary.medical.mortalityTotal)} ekor`
                    : "Belum ada catatan pengobatan"
                }
              />
            </div>

            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border/80 bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Syringe className="size-4 text-emerald-600" />
                  Jadwal vaksin dari program
                </p>
                <p className="text-muted-foreground">
                  Generate ulang dari program aktif (idempotent — Pending yang
                  sama tidak digandakan).{" "}
                  <Link
                    href="/dashboard/health/vaccines"
                    className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                  >
                    Lihat daftar vaksinasi
                  </Link>
                </p>
              </div>
              <form action={regenAction}>
                <input type="hidden" name="cageId" value={cage.id} />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={regenPending}
                >
                  {regenPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Generate jadwal vaksin dari program"
                  )}
                </Button>
              </form>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setCloseOpen(true)}
              >
                Tutup Siklus Kandang
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
                <TableHead className="text-right">Awal</TableHead>
                <TableHead className="text-right">Akhir</TableHead>
                <TableHead className="text-right">Mati+Afkir</TableHead>
                <TableHead className="text-right">Total TB</TableHead>
                <TableHead className="text-right">HDP Rata</TableHead>
                <TableHead className="text-right">FCR</TableHead>
                <TableHead className="text-right">Durasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cage.history.map((h) => {
                const loss = h.summary.mutations.mati + h.summary.mutations.afkir;
                return (
                  <TableRow key={h.id} className="hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground">
                      {formatBusinessDateFromDb(h.startDate)} —{" "}
                      {h.endDate ? formatBusinessDateFromDb(h.endDate) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCount(h.initialPopulation)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCount(h.summary.currentPopulation)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCount(loss)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCount(h.summary.production.cumulativeTb)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatHdpPercent(h.summary.production.averageHdp)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatFcr(h.summary.feed.fcr)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCycleAge(h.summary)}
                    </TableCell>
                  </TableRow>
                );
              })}
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
            <DialogTitle>Tutup Siklus Kandang</DialogTitle>
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
                    min={formatBusinessDateFromDb(cage.activeCycle.startDate)}
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

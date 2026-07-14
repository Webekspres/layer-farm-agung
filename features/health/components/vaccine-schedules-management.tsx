"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { CalendarClock, Loader2, Syringe, X } from "lucide-react";
import { VaccineSchedulesToolbar } from "@/features/health/components/vaccine-schedules-toolbar";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  RecordDateHiddenInput,
  RecordDatePicker,
  todayRecordDateValue,
} from "@/components/shared/record-date-picker";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import {
  createVaccineScheduleAction,
  type VaccineScheduleFormState,
} from "@/features/health/actions/create-vaccine-schedule";
import {
  completeVaccinationAction,
  type CompleteVaccinationFormState,
} from "@/features/health/actions/complete-vaccination";
import {
  cancelVaccineScheduleAction,
  type CancelVaccineScheduleFormState,
} from "@/features/health/actions/cancel-vaccine-schedule";
import {
  vaccineStatusBadgeVariant,
  vaccineStatusLabel,
} from "@/features/health/lib/status-labels";
import type {
  VaccineScheduleFormOptions,
  VaccineScheduleListItem,
} from "@/features/health/types";

const createInitial: VaccineScheduleFormState = {};
const completeInitial: CompleteVaccinationFormState = {};
const cancelInitial: CancelVaccineScheduleFormState = {};

type VaccineSchedulesManagementProps = {
  schedules: VaccineScheduleListItem[];
  pagination: PaginationMeta;
  formOptions: VaccineScheduleFormOptions;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function VaccineSchedulesManagement({
  schedules,
  pagination,
  formOptions,
}: VaccineSchedulesManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["status"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [completeTarget, setCompleteTarget] =
    useState<VaccineScheduleListItem | null>(null);
  const [cancelTarget, setCancelTarget] =
    useState<VaccineScheduleListItem | null>(null);

  const [cageId, setCageId] = useState(formOptions.cages[0]?.id ?? "");
  const [itemId, setItemId] = useState(formOptions.vaccineItems[0]?.id ?? "");
  const [scheduledDate, setScheduledDate] = useState<Date>(() =>
    todayRecordDateValue(),
  );

  const [createState, createAction, createPending] = useActionState(
    createVaccineScheduleAction,
    createInitial,
  );
  const [completeState, completeAction, completePending] = useActionState(
    completeVaccinationAction,
    completeInitial,
  );
  const [cancelState, cancelActionFn, cancelPending] = useActionState(
    cancelVaccineScheduleAction,
    cancelInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Jadwal vaksinasi berhasil dibuat.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(completeState, {
    successMessage: "Vaksinasi berhasil diselesaikan.",
    onSuccess: () => setCompleteTarget(null),
    when: Boolean(completeTarget),
  });

  useActionFeedback(cancelState, {
    successMessage: "Jadwal vaksinasi dibatalkan.",
    onSuccess: () => setCancelTarget(null),
    when: Boolean(cancelTarget),
  });

  function openCreateDialog() {
    setCageId(formOptions.cages[0]?.id ?? "");
    setItemId(formOptions.vaccineItems[0]?.id ?? "");
    setScheduledDate(todayRecordDateValue());
    setCreateOpen(true);
  }

  const noOptions =
    formOptions.cages.length === 0 || formOptions.vaccineItems.length === 0;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <VaccineSchedulesToolbar onCreateClick={openCreateDialog} />

      {noOptions ? (
        <p className="text-sm text-muted-foreground">
          Tambahkan kandang dan item vaksin (tipe &quot;Vaccine&quot; di
          Inventori) terlebih dahulu sebelum membuat jadwal.
        </p>
      ) : null}

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {schedules.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada jadwal vaksinasi.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Kandang</TableHead>
                <TableHead>Vaksin</TableHead>
                <TableHead>Tanggal jadwal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Jumlah dipakai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.cageName}
                    <div className="text-xs text-muted-foreground">
                      {schedule.locationName}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.itemName}</TableCell>
                  <TableCell>{formatDate(schedule.scheduledDate)}</TableCell>
                  <TableCell>
                    <Badge variant={vaccineStatusBadgeVariant(schedule.status)}>
                      {vaccineStatusLabel(schedule.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {schedule.quantityUsed != null
                      ? `${schedule.quantityUsed.toLocaleString("id-ID")} ${schedule.itemUnit}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {schedule.status === "Pending" ? (
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCompleteTarget(schedule)}
                        >
                          <Syringe className="size-4" />
                          Selesaikan
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelTarget(schedule)}
                        >
                          <X className="size-4" />
                          Batalkan
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="jadwal" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat jadwal vaksinasi</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <input type="hidden" name="cageId" value={cageId} />
            <input type="hidden" name="itemId" value={itemId} />
            <RecordDateHiddenInput name="scheduledDate" value={scheduledDate} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="schedule-cage">Kandang</FieldLabel>
                <Select value={cageId} onValueChange={setCageId} required>
                  <SelectTrigger id="schedule-cage">
                    <SelectValue placeholder="Pilih kandang" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.cages.map((cage) => (
                      <SelectItem key={cage.id} value={cage.id}>
                        {cage.name} — {cage.locationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="schedule-item">Vaksin</FieldLabel>
                <Select value={itemId} onValueChange={setItemId} required>
                  <SelectTrigger id="schedule-item">
                    <SelectValue placeholder="Pilih vaksin" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.vaccineItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="schedule-date">Tanggal jadwal</FieldLabel>
                <RecordDatePicker
                  id="schedule-date"
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  disableFuture={false}
                  placeholder="Pilih tanggal vaksinasi"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="schedule-notes">
                  Catatan — opsional
                </FieldLabel>
                <Textarea
                  id="schedule-notes"
                  name="notes"
                  placeholder="mis. dosis, metode pemberian"
                />
              </Field>
              {createState.error ? (
                <FieldError>{createState.error}</FieldError>
              ) : null}
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={createPending}>
                {createPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CalendarClock className="size-4" />
                )}
                Buat jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(completeTarget)}
        onOpenChange={(open) => {
          if (!open) setCompleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan vaksinasi</DialogTitle>
          </DialogHeader>
          {completeTarget ? (
            <form action={completeAction}>
              <input type="hidden" name="scheduleId" value={completeTarget.id} />
              <FieldGroup>
                <p className="text-sm text-muted-foreground">
                  {completeTarget.cageName} — {completeTarget.itemName}
                </p>
                <Field>
                  <FieldLabel htmlFor="complete-quantity">
                    Jumlah dipakai ({completeTarget.itemUnit})
                  </FieldLabel>
                  <Input
                    id="complete-quantity"
                    name="quantityUsed"
                    type="number"
                    step="any"
                    min="0"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="complete-notes">
                    Catatan pelaksanaan — opsional
                  </FieldLabel>
                  <Textarea id="complete-notes" name="notes" />
                </Field>
                {completeState.error ? (
                  <FieldError>{completeState.error}</FieldError>
                ) : null}
              </FieldGroup>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={completePending}>
                  {completePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Selesaikan
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan jadwal vaksinasi</DialogTitle>
          </DialogHeader>
          {cancelTarget ? (
            <form action={cancelActionFn}>
              <input type="hidden" name="scheduleId" value={cancelTarget.id} />
              <p className="text-sm text-muted-foreground">
                Jadwal vaksinasi {cancelTarget.itemName} untuk kandang{" "}
                {cancelTarget.cageName} pada {formatDate(cancelTarget.scheduledDate)}{" "}
                akan dibatalkan. Tindakan ini tidak dapat diurungkan.
              </p>
              {cancelState.error ? (
                <FieldError className="mt-2">{cancelState.error}</FieldError>
              ) : null}
              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelPending}
                >
                  {cancelPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Batalkan jadwal
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

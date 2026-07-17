"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Plus, Syringe, Trash2 } from "lucide-react";
import { useActionFeedback } from "@/components/shared/action-feedback";
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
  createVaccineProgramAction,
  type VaccineProgramFormState,
} from "@/features/health/actions/create-vaccine-program";
import { updateVaccineProgramAction } from "@/features/health/actions/update-vaccine-program";
import {
  deactivateVaccineProgramAction,
  type DeactivateVaccineProgramFormState,
} from "@/features/health/actions/deactivate-vaccine-program";
import type { VaccineProgramListItem } from "@/features/health/services/list-vaccine-programs";
import type {
  VaccineProgramDetail,
  VaccineProgramFormOptions,
} from "@/features/health/services/get-vaccine-program-form-options";

type StepDraft = {
  key: string;
  ageDays: string;
  itemId: string;
  pathogenLabel: string;
  formulationType: string;
  notes: string;
};

type VaccineProgramsManagementProps = {
  programs: VaccineProgramListItem[];
  formOptions: VaccineProgramFormOptions;
  programDetails: VaccineProgramDetail[];
};

const formInitial: VaccineProgramFormState = {};
const deactivateInitial: DeactivateVaccineProgramFormState = {};

function newStep(defaultItemId: string): StepDraft {
  return {
    key: crypto.randomUUID(),
    ageDays: "1",
    itemId: defaultItemId,
    pathogenLabel: "",
    formulationType: "",
    notes: "",
  };
}

function stepsToJson(steps: StepDraft[]) {
  return JSON.stringify(
    steps.map((s, index) => ({
      ...(isUuid(s.key) ? { id: s.key } : {}),
      ageDays: Number(s.ageDays),
      itemId: s.itemId,
      pathogenLabel: s.pathogenLabel || undefined,
      formulationType: s.formulationType || undefined,
      notes: s.notes || undefined,
      sortOrder: index,
    })),
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function VaccineProgramsManagement({
  programs,
  formOptions,
  programDetails,
}: VaccineProgramsManagementProps) {
  const detailById = useMemo(() => {
    const map = new Map<string, VaccineProgramDetail>();
    for (const d of programDetails) map.set(d.id, d);
    return map;
  }, [programDetails]);

  const defaultItemId = formOptions.items[0]?.id ?? "";

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VaccineProgramListItem | null>(
    null,
  );
  const [deactivateTarget, setDeactivateTarget] =
    useState<VaccineProgramListItem | null>(null);

  const [name, setName] = useState("");
  const [strainId, setStrainId] = useState("none");
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState<StepDraft[]>(() => [
    newStep(defaultItemId),
  ]);

  const [createState, createAction, createPending] = useActionState(
    createVaccineProgramAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateVaccineProgramAction,
    formInitial,
  );
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateVaccineProgramAction,
    deactivateInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Program vaksin berhasil dibuat.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Program vaksin berhasil diperbarui.",
    onSuccess: () => setEditTarget(null),
    when: Boolean(editTarget),
  });

  useActionFeedback(deactivateState, {
    successMessage: "Program vaksin dinonaktifkan.",
    onSuccess: () => setDeactivateTarget(null),
    when: Boolean(deactivateTarget),
  });

  function openCreate() {
    setName("");
    setStrainId("none");
    setIsActive(true);
    setSteps([newStep(defaultItemId)]);
    setCreateOpen(true);
  }

  function openEdit(program: VaccineProgramListItem) {
    const detail = detailById.get(program.id);
    setEditTarget(program);
    setName(program.name);
    setStrainId(program.strainId?.toString() ?? "none");
    setIsActive(program.isActive);
    setSteps(
      detail?.steps.map((s) => ({
        key: s.id,
        ageDays: String(s.ageDays),
        itemId: s.itemId,
        pathogenLabel: s.pathogenLabel ?? "",
        formulationType: s.formulationType ?? "",
        notes: s.notes ?? "",
      })) ?? [newStep(defaultItemId)],
    );
  }

  const dialogOpen = createOpen || Boolean(editTarget);
  const pending = createPending || updatePending;
  const formError = createOpen
    ? createState.error
    : editTarget
      ? updateState.error
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Template langkah berdasarkan umur (hari) sejak mulai siklus. Dipakai
          untuk generate jadwal operasional.
        </p>
        <Button
          type="button"
          onClick={openCreate}
          disabled={formOptions.items.length === 0}
        >
          <Plus className="size-4" />
          Program baru
        </Button>
      </div>

      {formOptions.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Belum ada item Vaccine/Vitamin di inventori tenant ini. Tambahkan item
          terlebih dahulu sebelum membuat program.
        </p>
      ) : null}

      <Table containerClassName="overflow-x-auto rounded-lg border border-border">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Strain</TableHead>
            <TableHead className="text-right">Langkah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                Belum ada program vaksin.
              </TableCell>
            </TableRow>
          ) : (
            programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell className="font-medium">{program.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {program.strainName ?? "Default (semua strain)"}
                </TableCell>
                <TableCell className="text-right">{program.stepCount}</TableCell>
                <TableCell>
                  <Badge variant={program.isActive ? "default" : "secondary"}>
                    {program.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(program)}
                    >
                      Edit
                    </Button>
                    {program.isActive ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeactivateTarget(program)}
                      >
                        Nonaktifkan
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditTarget(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="size-5" />
              {editTarget ? "Edit program vaksin" : "Program vaksin baru"}
            </DialogTitle>
          </DialogHeader>
          <form action={editTarget ? updateAction : createAction}>
            {editTarget ? (
              <input type="hidden" name="programId" value={editTarget.id} />
            ) : null}
            <input type="hidden" name="stepsJson" value={stepsToJson(steps)} />
            {editTarget ? (
              <input
                type="hidden"
                name="isActive"
                value={isActive ? "true" : "false"}
              />
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="program-name">Nama program</FieldLabel>
                <Input
                  id="program-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                />
              </Field>
              <Field>
                <FieldLabel>Strain (opsional)</FieldLabel>
                <Select value={strainId} onValueChange={setStrainId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default (semua strain)</SelectItem>
                    {formOptions.strains.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="strainId" value={strainId} />
              </Field>
              {editTarget ? (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={isActive ? "true" : "false"}
                    onValueChange={(v) => setIsActive(v === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FieldLabel>Langkah (umur hari)</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSteps((prev) => [...prev, newStep(defaultItemId)])
                    }
                  >
                    <Plus className="size-4" />
                    Tambah langkah
                  </Button>
                </div>
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-6"
                  >
                    <Field className="sm:col-span-1">
                      <FieldLabel>Hari ke-</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        value={step.ageDays}
                        onChange={(e) =>
                          setSteps((prev) =>
                            prev.map((s, i) =>
                              i === index
                                ? { ...s, ageDays: e.target.value }
                                : s,
                            ),
                          )
                        }
                        required
                      />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel>Item</FieldLabel>
                      <Select
                        value={step.itemId}
                        onValueChange={(value) =>
                          setSteps((prev) =>
                            prev.map((s, i) =>
                              i === index ? { ...s, itemId: value } : s,
                            ),
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formOptions.items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field className="sm:col-span-1">
                      <FieldLabel>Patogen</FieldLabel>
                      <Input
                        value={step.pathogenLabel}
                        onChange={(e) =>
                          setSteps((prev) =>
                            prev.map((s, i) =>
                              i === index
                                ? { ...s, pathogenLabel: e.target.value }
                                : s,
                            ),
                          )
                        }
                        placeholder="Opsional"
                      />
                    </Field>
                    <Field className="sm:col-span-1">
                      <FieldLabel>Formulasi</FieldLabel>
                      <Input
                        value={step.formulationType}
                        onChange={(e) =>
                          setSteps((prev) =>
                            prev.map((s, i) =>
                              i === index
                                ? { ...s, formulationType: e.target.value }
                                : s,
                            ),
                          )
                        }
                        placeholder="Live / Killed"
                      />
                    </Field>
                    <div className="flex items-end sm:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={steps.length <= 1}
                        onClick={() =>
                          setSteps((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        aria-label="Hapus langkah"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <Field className="sm:col-span-6">
                      <FieldLabel>Catatan</FieldLabel>
                      <Textarea
                        value={step.notes}
                        onChange={(e) =>
                          setSteps((prev) =>
                            prev.map((s, i) =>
                              i === index ? { ...s, notes: e.target.value } : s,
                            ),
                          )
                        }
                        rows={2}
                      />
                    </Field>
                  </div>
                ))}
              </div>
              {formError ? <FieldError>{formError}</FieldError> : null}
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setEditTarget(null);
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={pending || steps.length === 0}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editTarget ? (
                  "Simpan"
                ) : (
                  "Buat program"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nonaktifkan program?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Program &quot;{deactivateTarget?.name}&quot; tidak akan dipakai
            untuk generate jadwal baru. Jadwal Pending yang sudah ada tetap
            tersimpan.
          </p>
          {deactivateState.error ? (
            <FieldError>{deactivateState.error}</FieldError>
          ) : null}
          <form action={deactivateAction}>
            <input
              type="hidden"
              name="programId"
              value={deactivateTarget?.id ?? ""}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeactivateTarget(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deactivatePending}
              >
                {deactivatePending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Nonaktifkan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

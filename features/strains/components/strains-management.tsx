"use client";

import { useActionState, useEffect, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil, TrendingUp, Plus, Trash2 } from "lucide-react";
import { StrainsToolbar } from "@/features/strains/components/strains-toolbar";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createStrainAction,
  type StrainFormState,
} from "@/features/strains/actions/create-strain";
import { updateStrainAction } from "@/features/strains/actions/update-strain";
import { createProductionTargetAction } from "@/features/strains/actions/create-target";
import { deleteProductionTargetAction } from "@/features/strains/actions/delete-target";
import { getProductionTargetsAction } from "@/features/strains/actions/get-targets";
import type { StrainListItem } from "@/features/strains/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: StrainFormState = {};

type StrainsManagementProps = {
  strains: StrainListItem[];
  pagination: PaginationMeta;
};

export function StrainsManagement({
  strains,
  pagination,
}: StrainsManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["usage"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [viewTargetOpen, setViewTargetOpen] = useState(false);
  const [editing, setEditing] = useState<StrainListItem | null>(null);
  const [targetingStrain, setTargetingStrain] = useState<StrainListItem | null>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const [createState, createAction, createPending] = useActionState(
    createStrainAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateStrainAction,
    formInitial,
  );
  const [addTargetState, addTargetAction, addTargetPending] = useActionState(
    createProductionTargetAction,
    formInitial,
  );
  const [deleteTargetState, deleteTargetAction, deleteTargetPending] = useActionState(
    deleteProductionTargetAction,
    formInitial,
  );

  const fetchTargets = async (strainId: number) => {
    setLoadingTargets(true);
    try {
      const data = await getProductionTargetsAction(strainId);
      setTargets(data);
    } catch {
      // ignore
    } finally {
      setLoadingTargets(false);
    }
  };

  useEffect(() => {
    if ((targetOpen || viewTargetOpen) && targetingStrain) {
      fetchTargets(targetingStrain.id);
    }
  }, [targetOpen, viewTargetOpen, targetingStrain]);

  useActionFeedback(createState, {
    successMessage: "Strain berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Strain berhasil diperbarui.",
    onSuccess: () => setEditOpen(false),
    when: editOpen,
  });

  useActionFeedback(addTargetState, {
    successMessage: "Target performa berhasil ditambahkan.",
    onSuccess: () => {
      if (targetingStrain) fetchTargets(targetingStrain.id);
    },
    when: targetOpen,
  });

  useActionFeedback(deleteTargetState, {
    successMessage: "Target performa berhasil dihapus.",
    onSuccess: () => {
      if (targetingStrain) fetchTargets(targetingStrain.id);
    },
    when: targetOpen,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <StrainsToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {strains.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada strain. Tambahkan strain ayam untuk dipakai di kandang.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                <TableHead>Target Performa</TableHead>
                <TableHead>Kandang</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strains.map((strain) => (
                <TableRow key={strain.id}>
                  <TableCell className="font-medium">{strain.name}</TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                    {strain.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetingStrain(strain);
                        setViewTargetOpen(true);
                      }}
                      title="Lihat target performa"
                      className="cursor-pointer"
                    >
                      <Badge
                        variant="outline"
                        className="font-medium transition-colors hover:bg-accent hover:border-primary/50"
                      >
                        {strain.targetCount} Target
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>{strain.cageCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setTargetingStrain(strain);
                          setTargetOpen(true);
                        }}
                        title="Target Performa"
                      >
                        <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="sr-only">Target Performa</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditing(strain);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="strain" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah strain</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="strain-name">Nama</FieldLabel>
                <Input id="strain-name" name="name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="strain-desc">Deskripsi</FieldLabel>
                <Textarea id="strain-desc" name="description" rows={3} />
              </Field>
              {createState.error ? <FieldError>{createState.error}</FieldError> : null}
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={createPending}>
                {createPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit strain</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction}>
              <input type="hidden" name="id" value={editing.id} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-strain-name">Nama</FieldLabel>
                  <Input
                    id="edit-strain-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-strain-desc">Deskripsi</FieldLabel>
                  <Textarea
                    id="edit-strain-desc"
                    name="description"
                    rows={3}
                    defaultValue={editing.description ?? ""}
                  />
                </Field>
                {updateState.error ? (
                  <FieldError>{updateState.error}</FieldError>
                ) : null}
              </FieldGroup>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={updatePending}>
                  {updatePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={targetOpen} onOpenChange={setTargetOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Target Performa — {targetingStrain?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Daftar Target Umur</h3>
              {loadingTargets ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : targets.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                  Belum ada target performa. Tambahkan target di bawah.
                </p>
              ) : (
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Umur</TableHead>
                        <TableHead>Target HDP (%)</TableHead>
                        <TableHead>Target FCR</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targets.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-semibold">{t.age_in_weeks} Minggu</TableCell>
                          <TableCell>{t.target_hdp}%</TableCell>
                          <TableCell>{t.target_fcr}</TableCell>
                          <TableCell className="text-right">
                            <form action={deleteTargetAction} className="inline">
                              <input type="hidden" name="id" value={t.id} />
                              <input type="hidden" name="strainId" value={t.strain_id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive/80"
                                disabled={deleteTargetPending}
                              >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <form action={addTargetAction} className="border-t border-border pt-4">
              {targetingStrain ? (
                <input type="hidden" name="strainId" value={targetingStrain.id} />
              ) : null}
              <h3 className="text-sm font-semibold text-foreground mb-3">Tambah Target Baru</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="target-age">Umur (Minggu)</FieldLabel>
                  <Input
                    id="target-age"
                    name="ageInWeeks"
                    type="number"
                    min={1}
                    required
                    placeholder="Contoh: 18"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="target-hdp">Target HDP (%)</FieldLabel>
                  <Input
                    id="target-hdp"
                    name="targetHdp"
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    required
                    placeholder="Contoh: 90.5"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="target-fcr">Target FCR</FieldLabel>
                  <Input
                    id="target-fcr"
                    name="targetFcr"
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    placeholder="Contoh: 2.15"
                  />
                </Field>
              </div>
              
              {addTargetState.error ? (
                <FieldError className="mt-2">{addTargetState.error}</FieldError>
              ) : null}
              {deleteTargetState.error ? (
                <FieldError className="mt-2">{deleteTargetState.error}</FieldError>
              ) : null}

              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={addTargetPending || deleteTargetPending}>
                  {addTargetPending ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="size-4 mr-2" />
                  )}
                  Tambah Target
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Read-only target view — opened by clicking the badge */}
      <Dialog open={viewTargetOpen} onOpenChange={setViewTargetOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Target Performa — {targetingStrain?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingTargets ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : targets.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                Belum ada target performa yang ditambahkan untuk strain ini.
              </p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Umur</TableHead>
                      <TableHead>Target HDP (%)</TableHead>
                      <TableHead>Target FCR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-semibold">{t.age_in_weeks} Minggu</TableCell>
                        <TableCell>{t.target_hdp}%</TableCell>
                        <TableCell>{t.target_fcr}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* <p className="text-xs text-muted-foreground">
              Gunakan ikon{" "}
              <TrendingUp className="inline size-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
              di baris tabel untuk menambah atau menghapus target.
            </p> */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

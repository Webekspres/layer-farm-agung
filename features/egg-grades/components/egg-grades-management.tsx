"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { EggGradesToolbar } from "@/features/egg-grades/components/egg-grades-toolbar";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
import { Button } from "@/components/ui/button";
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
  createEggGradeAction,
  type EggGradeFormState,
} from "@/features/egg-grades/actions/create-egg-grade";
import { updateEggGradeAction } from "@/features/egg-grades/actions/update-egg-grade";
import type { EggGradeListItem } from "@/features/egg-grades/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: EggGradeFormState = {};

type EggGradesManagementProps = {
  grades: EggGradeListItem[];
  pagination: PaginationMeta;
};

export function EggGradesManagement({
  grades,
  pagination,
}: EggGradesManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["usage"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EggGradeListItem | null>(null);
  const [createState, createAction, createPending] = useActionState(
    createEggGradeAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateEggGradeAction,
    formInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Grade telur berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Grade telur berhasil diperbarui.",
    onSuccess: () => setEditOpen(false),
    when: editOpen,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <EggGradesToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {grades.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada grade telur. Tambahkan grade untuk produksi dan penjualan.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {grade.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(grade);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="grade telur" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah grade telur</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="grade-name">Nama</FieldLabel>
                <Input id="grade-name" name="name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="grade-desc">Deskripsi</FieldLabel>
                <Textarea id="grade-desc" name="description" rows={3} />
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
            <DialogTitle>Edit grade telur</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction}>
              <input type="hidden" name="id" value={editing.id} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-grade-name">Nama</FieldLabel>
                  <Input
                    id="edit-grade-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-grade-desc">Deskripsi</FieldLabel>
                  <Textarea
                    id="edit-grade-desc"
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
    </div>
  );
}

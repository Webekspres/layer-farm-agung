"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { StrainsToolbar } from "@/features/strains/components/strains-toolbar";
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
  createStrainAction,
  type StrainFormState,
} from "@/features/strains/actions/create-strain";
import { updateStrainAction } from "@/features/strains/actions/update-strain";
import type { StrainListItem } from "@/features/strains/types";

const formInitial: StrainFormState = {};

type StrainsManagementProps = {
  strains: StrainListItem[];
};

export function StrainsManagement({ strains }: StrainsManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["usage"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<StrainListItem | null>(null);
  const [createState, createAction, createPending] = useActionState(
    createStrainAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateStrainAction,
    formInitial,
  );

  useEffect(() => {
    if (createState.success) setCreateOpen(false);
  }, [createState.success]);

  useEffect(() => {
    if (updateState.success) setEditOpen(false);
  }, [updateState.success]);

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
                  <TableCell>{strain.cageCount}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
    </div>
  );
}

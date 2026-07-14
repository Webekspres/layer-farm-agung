"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
import { LocationsToolbar } from "@/features/locations/components/locations-toolbar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createLocationAction,
  type LocationFormState,
} from "@/features/locations/actions/create-location";
import { deleteLocationAction } from "@/features/locations/actions/delete-location";
import { updateLocationAction } from "@/features/locations/actions/update-location";
import type { LocationListItem } from "@/features/locations/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: LocationFormState = {};

type LocationsManagementProps = {
  locations: LocationListItem[];
  pagination: PaginationMeta;
};

export function LocationsManagement({
  locations,
  pagination,
}: LocationsManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["occupancy"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<LocationListItem | null>(null);
  const [deleting, setDeleting] = useState<LocationListItem | null>(null);

  const [createState, createAction, createPending] = useActionState(
    createLocationAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateLocationAction,
    formInitial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteLocationAction,
    formInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Lokasi berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Lokasi berhasil diperbarui.",
    onSuccess: () => setEditOpen(false),
    when: editOpen,
  });

  useActionFeedback(deleteState, {
    successMessage: "Lokasi berhasil dihapus.",
    onSuccess: () => {
      setDeleteOpen(false);
      setDeleting(null);
    },
    when: deleteOpen,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <LocationsToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {locations.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada lokasi. Tambah lokasi peternakan untuk mulai mengatur kandang.",
            )}
          </div>
        ) : (
          <Table containerClassName="overflow-x-auto overscroll-x-contain">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead>Kandang</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.cageCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(location);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setDeleting(location);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Hapus</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="lokasi" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah lokasi</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-location-name">Nama lokasi</FieldLabel>
                <Input id="create-location-name" name="name" required />
                {createState.error ? (
                  <FieldError>{createState.error}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={createPending}>
                {createPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit lokasi</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction}>
              <input type="hidden" name="id" value={editing.id} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-location-name">Nama lokasi</FieldLabel>
                  <Input
                    id="edit-location-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                  />
                  {updateState.error ? (
                    <FieldError>{updateState.error}</FieldError>
                  ) : null}
                </Field>
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus lokasi</DialogTitle>
          </DialogHeader>
          {deleting ? (
            <form action={deleteAction}>
              <input type="hidden" name="id" value={deleting.id} />
              <p className="text-sm text-muted-foreground">
                Yakin hapus lokasi <strong>{deleting.name}</strong>?
              </p>
              {deleteState.error ? (
                <p className="mt-2 text-sm text-destructive">{deleteState.error}</p>
              ) : null}
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="destructive" disabled={deletePending}>
                  {deletePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Hapus
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

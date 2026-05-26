"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { TenantsToolbar } from "@/features/tenants/components/tenants-toolbar";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createTenantAction,
  type TenantFormState,
} from "@/features/tenants/actions/create-tenant";
import { updateTenantAction } from "@/features/tenants/actions/update-tenant";
import type { TenantListItem } from "@/features/tenants/types";

const formInitial: TenantFormState = {};

type TenantsManagementProps = {
  tenants: TenantListItem[];
};

export function TenantsManagement({ tenants }: TenantsManagementProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<TenantListItem | null>(null);
  const [createState, createAction, createPending] = useActionState(
    createTenantAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateTenantAction,
    formInitial,
  );
  const [isActiveCreate, setIsActiveCreate] = useState(true);
  const [isActiveEdit, setIsActiveEdit] = useState(true);

  useEffect(() => {
    if (createState.success) setCreateOpen(false);
  }, [createState.success]);

  useEffect(() => {
    if (updateState.success) setEditOpen(false);
  }, [updateState.success]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <TenantsToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {tenants.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Tidak ada tenant yang cocok dengan filter saat ini.
          </div>
        ) : (
          <Table containerClassName="overflow-x-auto overscroll-x-contain">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {tenant.slug}
                  </TableCell>
                  <TableCell>{tenant.userCount}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.isActive ? "default" : "secondary"}>
                      {tenant.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(tenant);
                        setIsActiveEdit(tenant.isActive);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah tenant</DialogTitle>
          </DialogHeader>
          <form action={createAction} className="flex flex-col gap-4">
            <input type="hidden" name="isActive" value={isActiveCreate ? "true" : "false"} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-name">Nama tenant</FieldLabel>
                <Input id="create-name" name="name" required disabled={createPending} />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-slug">Slug tenant</FieldLabel>
                <Input
                  id="create-slug"
                  name="slug"
                  placeholder="tenant-utama"
                  required
                  disabled={createPending}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="create-active">Aktif</FieldLabel>
                <Switch
                  id="create-active"
                  checked={isActiveCreate}
                  onCheckedChange={setIsActiveCreate}
                  disabled={createPending}
                />
              </Field>
              {createState.error ? <FieldError>{createState.error}</FieldError> : null}
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={createPending}>
                {createPending ? <Loader2 className="size-4 animate-spin" /> : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit tenant</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={editing.id} />
              <input type="hidden" name="isActive" value={isActiveEdit ? "true" : "false"} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-name">Nama tenant</FieldLabel>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                    disabled={updatePending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-slug">Slug tenant</FieldLabel>
                  <Input
                    id="edit-slug"
                    name="slug"
                    defaultValue={editing.slug}
                    required
                    disabled={updatePending}
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="edit-active">Aktif</FieldLabel>
                  <Switch
                    id="edit-active"
                    checked={isActiveEdit}
                    onCheckedChange={setIsActiveEdit}
                    disabled={updatePending}
                  />
                </Field>
                {updateState.error ? <FieldError>{updateState.error}</FieldError> : null}
              </FieldGroup>
              <DialogFooter>
                <Button type="submit" disabled={updatePending}>
                  {updatePending ? <Loader2 className="size-4 animate-spin" /> : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

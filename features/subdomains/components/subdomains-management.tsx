"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
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
  createSubdomainAction,
  type SubdomainFormState,
} from "@/features/subdomains/actions/create-subdomain";
import {
  updateSubdomainAction,
} from "@/features/subdomains/actions/update-subdomain";
import type { SubdomainListItem } from "@/features/subdomains/types";

const formInitial: SubdomainFormState = {};

type SubdomainsManagementProps = {
  subdomains: SubdomainListItem[];
};

export function SubdomainsManagement({ subdomains }: SubdomainsManagementProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<SubdomainListItem | null>(null);
  const [createState, createAction, createPending] = useActionState(
    createSubdomainAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateSubdomainAction,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Kelola cabang peternakan (tenant). Superadmin dapat berpindah konteks
          cabang dari header.
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          className="w-full shrink-0 sm:w-auto"
        >
          <Plus className="size-4" />
          Tambah cabang
        </Button>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table containerClassName="overflow-x-auto overscroll-x-contain">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Nama</TableHead>
              <TableHead className="hidden sm:table-cell">URL</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subdomains.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.name}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {sub.subdomainUrl}
                </TableCell>
                <TableCell>{sub.userCount}</TableCell>
                <TableCell>
                  <Badge variant={sub.isActive ? "default" : "secondary"}>
                    {sub.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditing(sub);
                      setIsActiveEdit(sub.isActive);
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
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah cabang</DialogTitle>
          </DialogHeader>
          <form action={createAction} className="flex flex-col gap-4">
            <input type="hidden" name="isActive" value={isActiveCreate ? "true" : "false"} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-name">Nama cabang</FieldLabel>
                <Input id="create-name" name="name" required disabled={createPending} />
              </Field>
              <Field>
                <FieldLabel htmlFor="create-url">URL subdomain</FieldLabel>
                <Input
                  id="create-url"
                  name="subdomainUrl"
                  placeholder="cabang-utama"
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
            <DialogTitle>Edit cabang</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={editing.id} />
              <input type="hidden" name="isActive" value={isActiveEdit ? "true" : "false"} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-name">Nama cabang</FieldLabel>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                    disabled={updatePending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-url">URL subdomain</FieldLabel>
                  <Input
                    id="edit-url"
                    name="subdomainUrl"
                    defaultValue={editing.subdomainUrl}
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

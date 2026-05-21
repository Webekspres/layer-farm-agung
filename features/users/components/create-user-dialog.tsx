"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createUserAction,
  type CreateUserState,
} from "@/features/users/actions/create-user";
import {
  isSuperadminRole,
  subdomainIdAfterRoleChange,
} from "@/features/users/lib/role-subdomain";
import type { UserFormOptions } from "@/features/users/types";

const initialState: CreateUserState = {};

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formOptions: UserFormOptions;
};

export function CreateUserDialog({
  open,
  onOpenChange,
  formOptions,
}: CreateUserDialogProps) {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    initialState,
  );

  const defaultBranchId =
    formOptions.defaultSubdomainId ?? formOptions.subdomains[0]?.id ?? "";

  const [roleId, setRoleId] = useState("");
  const [subdomainId, setSubdomainId] = useState(defaultBranchId);
  const [isActive, setIsActive] = useState(true);

  const superadminSelected =
    Boolean(roleId) && isSuperadminRole(roleId, formOptions.roles);

  function handleRoleChange(nextRoleId: string) {
    setRoleId(nextRoleId);
    setSubdomainId((current) =>
      subdomainIdAfterRoleChange(
        nextRoleId,
        current,
        formOptions.roles,
        formOptions.subdomains,
        defaultBranchId,
      ),
    );
  }

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      setRoleId("");
      setSubdomainId(defaultBranchId);
      setIsActive(true);
    }
  }, [state.success, onOpenChange, defaultBranchId]);

  useEffect(() => {
    if (open) {
      setRoleId("");
      setSubdomainId(defaultBranchId);
    }
  }, [open, defaultBranchId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-shell">
        <DialogHeader className="dialog-header-padding">
          <DialogTitle>Tambah pengguna</DialogTitle>
          <DialogDescription>
            Buat akun staff atau admin baru. Password awal wajib diisi untuk login
            pertama.
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-body-scroll">
          <form action={formAction} id="create-user-form" className="dialog-form-fields">
            <input type="hidden" name="roleId" value={roleId} />
            <input type="hidden" name="subdomainId" value={subdomainId} />
            <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />

            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="fullName">Nama lengkap</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  autoComplete="name"
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email (opsional)</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password awal</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isPending}
                  placeholder="Minimal 8 karakter"
                />
                <FieldDescription>
                  Bisa diubah nanti dari menu aksi di tabel pengguna.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="roleId">Peran</FieldLabel>
                <Select
                  value={roleId}
                  onValueChange={handleRoleChange}
                  required
                  disabled={isPending}
                >
                  <SelectTrigger id="roleId" className="w-full">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {formOptions.isGlobalAdmin ? (
                <Field>
                  <FieldLabel htmlFor="subdomainId">Cabang</FieldLabel>
                  {superadminSelected ? (
                    <>
                      <Select value="global" disabled>
                        <SelectTrigger id="subdomainId" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global (superadmin)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Peran superadmin selalu terikat akses global, bukan cabang
                        tertentu.
                      </FieldDescription>
                    </>
                  ) : (
                    <>
                      <Select
                        value={subdomainId}
                        onValueChange={setSubdomainId}
                        disabled={isPending || !roleId}
                        required
                      >
                        <SelectTrigger id="subdomainId" className="w-full">
                          <SelectValue placeholder="Pilih cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          {formOptions.subdomains.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Admin dan staff harus dipetakan ke satu cabang.
                      </FieldDescription>
                    </>
                  )}
                </Field>
              ) : null}

              <Field
                orientation="horizontal"
                className="items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor="isActive">Akun aktif</Label>
                  <FieldDescription>
                    Pengguna nonaktif tidak dapat login.
                  </FieldDescription>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isPending}
                />
              </Field>

              {state.error ? <FieldError>{state.error}</FieldError> : null}
            </FieldGroup>
          </form>
        </div>

        <DialogFooter className="dialog-footer-padding">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" form="create-user-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

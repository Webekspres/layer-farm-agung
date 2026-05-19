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

  const defaultSubdomain =
    formOptions.defaultSubdomainId ??
    (formOptions.isGlobalAdmin ? "global" : "");

  const [roleId, setRoleId] = useState("");
  const [subdomainId, setSubdomainId] = useState(defaultSubdomain);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      setRoleId("");
      setSubdomainId(defaultSubdomain);
      setIsActive(true);
    }
  }, [state.success, onOpenChange, defaultSubdomain]);

  useEffect(() => {
    if (open) {
      setSubdomainId(defaultSubdomain);
    }
  }, [open, defaultSubdomain]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah pengguna</DialogTitle>
          <DialogDescription>
            Buat akun staff atau admin. Password dapat diubah pengguna nanti
            setelah login.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="roleId" value={roleId} />
          <input type="hidden" name="subdomainId" value={subdomainId} />
          <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
          <FieldGroup>
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
              />
              <FieldDescription>Minimal 8 karakter.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="roleId">Peran</FieldLabel>
              <Select
                value={roleId}
                onValueChange={setRoleId}
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
                <Select
                  value={subdomainId}
                  onValueChange={setSubdomainId}
                  disabled={isPending}
                >
                  <SelectTrigger id="subdomainId" className="w-full">
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (superadmin)</SelectItem>
                    {formOptions.subdomains.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            <Field orientation="horizontal">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
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
  updateUserAction,
  type UpdateUserState,
} from "@/features/users/actions/update-user";
import {
  isSuperadminRole,
  tenantIdAfterRoleChange,
} from "@/features/users/lib/role-tenant";
import type { UserFormOptions, UserListItem } from "@/features/users/types";

const updateInitial: UpdateUserState = {};

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
  formOptions: UserFormOptions;
  isSelf: boolean;
};

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  formOptions,
  isSelf,
}: EditUserDialogProps) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateUserAction,
    updateInitial,
  );

  const defaultBranchId =
    formOptions.defaultTenantId ?? formOptions.tenants[0]?.id ?? "";

  const [roleId, setRoleId] = useState("");
  const [tenantId, setTenantId] = useState("global");
  const [isActive, setIsActive] = useState(true);
  const [syncKey, setSyncKey] = useState<string | null>(null);
  const nextKey = open && user ? `${user.id}:${open}` : null;
  if (nextKey !== syncKey) {
    setSyncKey(nextKey);
    if (user && open) {
      setRoleId(String(user.roleId));
      setTenantId(user.tenantId ?? "global");
      setIsActive(user.isActive);
    }
  }

  const superadminSelected =
    Boolean(roleId) && isSuperadminRole(roleId, formOptions.roles);

  function handleRoleChange(nextRoleId: string) {
    setRoleId(nextRoleId);
    setTenantId((current) =>
      tenantIdAfterRoleChange(
        nextRoleId,
        current,
        formOptions.roles,
        formOptions.tenants,
        defaultBranchId,
      ),
    );
  }

  useActionFeedback(updateState, {
    successMessage: "Pengguna berhasil diperbarui.",
    when: open,
    onSuccess: () => onOpenChange(false),
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-shell-wide">
        <DialogHeader className="dialog-header-padding">
          <DialogTitle>Edit pengguna</DialogTitle>
          <DialogDescription>
            Perbarui data akun untuk{" "}
            <span className="font-medium text-foreground">{user.username}</span>.
            Untuk mengubah password, gunakan menu aksi di tabel.
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-body-scroll">
          <form action={updateAction} id="edit-user-form" className="dialog-form-fields">
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="roleId" value={roleId} />
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />

            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="edit-fullName">Nama lengkap</FieldLabel>
                <Input
                  id="edit-fullName"
                  name="fullName"
                  defaultValue={user.fullName}
                  required
                  disabled={updatePending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-username">Username</FieldLabel>
                <Input
                  id="edit-username"
                  name="username"
                  defaultValue={user.username}
                  required
                  disabled={updatePending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-email">Email (opsional)</FieldLabel>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={user.email ?? ""}
                  disabled={updatePending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-roleId">Peran</FieldLabel>
                <Select
                  value={roleId}
                  onValueChange={handleRoleChange}
                  disabled={updatePending}
                >
                  <SelectTrigger id="edit-roleId" className="w-full">
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
                  <FieldLabel htmlFor="edit-tenantId">Tenant</FieldLabel>
                  {superadminSelected ? (
                    <>
                      <Select value="global" disabled>
                        <SelectTrigger id="edit-tenantId" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global (superadmin)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Peran superadmin selalu terikat akses global.
                      </FieldDescription>
                    </>
                  ) : (
                    <>
                      <Select
                        value={tenantId}
                        onValueChange={setTenantId}
                        disabled={updatePending}
                        required
                      >
                        <SelectTrigger id="edit-tenantId" className="w-full">
                          <SelectValue placeholder="Pilih tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {formOptions.tenants.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Admin dan staff harus dipetakan ke satu tenant.
                      </FieldDescription>
                    </>
                  )}
                </Field>
              ) : null}
              <Field orientation="horizontal" className="items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-isActive">Akun aktif</Label>
                  <FieldDescription>
                    Nonaktifkan untuk menutup akses login.
                  </FieldDescription>
                </div>
                <Switch
                  id="edit-isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={updatePending || isSelf}
                />
              </Field>
              {updateState.error ? <FieldError>{updateState.error}</FieldError> : null}
            </FieldGroup>
          </form>
        </div>

        <DialogFooter className="dialog-footer-padding">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePending}
          >
            Batal
          </Button>
          <Button type="submit" form="edit-user-form" disabled={updatePending}>
            {updatePending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan perubahan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

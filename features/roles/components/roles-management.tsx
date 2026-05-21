"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  updateRolePermissionsAction,
  type UpdateRolePermissionsState,
} from "@/features/roles/actions/update-role-permissions";
import type { PermissionItem, RoleWithPermissions } from "@/features/roles/types";

const initialState: UpdateRolePermissionsState = {};

type RolesManagementProps = {
  roles: RoleWithPermissions[];
  permissions: PermissionItem[];
};

function formatPermissionLabel(name: string) {
  return name.replaceAll("_", " ");
}

function toPermissionSet(role: RoleWithPermissions | undefined) {
  return new Set(role?.permissionIds ?? []);
}

export function RolesManagement({ roles, permissions }: RolesManagementProps) {
  const firstRole = roles[0];
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(
    firstRole?.id ?? null,
  );
  const [checked, setChecked] = useState<Set<number>>(() =>
    toPermissionSet(firstRole),
  );
  const [state, formAction, isPending] = useActionState(
    updateRolePermissionsAction,
    initialState,
  );

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
  const isSuperadminRole = selectedRole?.name === "superadmin";

  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      setChecked(toPermissionSet(role));
    }
  }, [selectedRoleId, roles]);

  function selectRole(role: RoleWithPermissions) {
    setSelectedRoleId(role.id);
  }

  function togglePermission(id: number, enabled: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (enabled) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base">Daftar peran</CardTitle>
          <CardDescription>Pilih peran untuk mengatur permission.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {roles.map((role) => (
            <Button
              key={role.id}
              type="button"
              variant={selectedRoleId === role.id ? "secondary" : "ghost"}
              className="h-auto w-full justify-start px-3 py-2.5 text-left"
              onClick={() => selectRole(role)}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium capitalize">{role.name}</span>
                <span className="text-xs text-muted-foreground">
                  {role.userCount} pengguna · {role.permissionIds.length} permission
                </span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="min-w-0 border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base capitalize">
            {selectedRole?.name ?? "Permission"}
          </CardTitle>
          <CardDescription>
            {selectedRole?.description ??
              "Centang permission yang boleh dipakai peran ini."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedRole ? (
            <p className="text-sm text-muted-foreground">Tidak ada peran.</p>
          ) : isSuperadminRole ? (
            <div className="flex flex-wrap gap-2">
              {permissions.map((p) => (
                <Badge key={p.id} variant="secondary">
                  {formatPermissionLabel(p.name)}
                </Badge>
              ))}
              <p className="w-full text-sm text-muted-foreground">
                Superadmin selalu memiliki semua permission (dikelola via seed).
              </p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="roleId" value={selectedRole.id} />
              <input
                type="hidden"
                name="permissionIds"
                value={[...checked].join(",")}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <Label
                      htmlFor={`perm-${permission.id}`}
                      className="cursor-pointer text-sm capitalize"
                    >
                      {formatPermissionLabel(permission.name)}
                    </Label>
                    <Switch
                      id={`perm-${permission.id}`}
                      checked={checked.has(permission.id)}
                      onCheckedChange={(v) => togglePermission(permission.id, v)}
                      disabled={isPending}
                    />
                  </div>
                ))}
              </div>
              {state.error ? <FieldError>{state.error}</FieldError> : null}
              {state.success ? (
                <p className="flex items-center gap-1.5 text-sm text-primary">
                  <Check className="size-4" />
                  Permission berhasil disimpan.
                </p>
              ) : null}
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan permission"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

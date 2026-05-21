"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createPermissionAction,
  type CreatePermissionState,
} from "@/features/permissions/actions/create-permission";
import { deletePermissionAction } from "@/features/permissions/actions/delete-permission";
import { isWiredPermission } from "@/features/permissions/config/wired-permissions";
import type { PermissionItem } from "@/features/roles/types";

const createInitial: CreatePermissionState = {};

type PermissionsRegistryProps = {
  permissions: PermissionItem[];
};

function formatPermissionLabel(name: string) {
  return name.replaceAll("_", " ");
}

export function PermissionsRegistry({ permissions }: PermissionsRegistryProps) {
  const router = useRouter();
  const [createState, createAction, createPending] = useActionState(
    createPermissionAction,
    createInitial,
  );
  const [deletePending, startDelete] = useTransition();

  return (
    <Card className="border-border/80 shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading text-base">Daftar permission</CardTitle>
        <CardDescription>
          Permission di database mengatur akses per peran. Nama yang dipakai di
          kode (route, menu, action) harus sama persis. Tambah permission baru di
          sini, lalu hubungkan ke peran — fitur di kode perlu{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            requirePermission(&quot;nama&quot;)
          </code>{" "}
          agar berlaku.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form action={createAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="perm-name">Permission baru</FieldLabel>
            <Input
              id="perm-name"
              name="name"
              placeholder="manage_feed"
              required
              disabled={createPending}
              autoComplete="off"
            />
          </Field>
          <Button type="submit" disabled={createPending} className="shrink-0">
            {createPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Tambah"
            )}
          </Button>
        </form>
        {createState.error ? <FieldError>{createState.error}</FieldError> : null}
        {createState.success ? (
          <p className="text-sm text-primary">Permission berhasil ditambahkan.</p>
        ) : null}

        <ul className="flex flex-col gap-2">
          {permissions.map((permission) => {
            const wired = isWiredPermission(permission.name);
            return (
              <li
                key={permission.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-mono text-sm">{permission.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {formatPermissionLabel(permission.name)}
                  </span>
                  {wired ? (
                    <Badge variant="secondary" className="text-xs">
                      Dipakai di app
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Belum di kode
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={wired || deletePending}
                  aria-label={`Hapus ${permission.name}`}
                  onClick={() => {
                    startDelete(async () => {
                      const result = await deletePermissionAction(permission.id);
                      if (result.success) {
                        router.refresh();
                      }
                    });
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

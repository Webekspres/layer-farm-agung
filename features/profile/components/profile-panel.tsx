"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  changeOwnPasswordAction,
  type ChangeOwnPasswordState,
} from "@/features/profile/actions/change-own-password";
import type { ServerSession } from "@/features/auth/lib/session";

const initialState: ChangeOwnPasswordState = {};

type ProfilePanelProps = {
  session: ServerSession;
};

export function ProfilePanel({ session }: ProfilePanelProps) {
  const [state, formAction, isPending] = useActionState(
    changeOwnPasswordAction,
    initialState,
  );

  const activeSubdomain =
    session.session.activeSubdomainId ?? session.user.subdomainId;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading">Informasi akun</CardTitle>
          <CardDescription>Data sesi login Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="Nama" value={session.user.fullName ?? session.user.name ?? "—"} />
          <Row label="Username" value={session.user.username} />
          <Row label="Email" value={session.user.email ?? "—"} />
          <Row label="Peran" value={session.user.roleName} />
          <Row
            label="Cabang aktif"
            value={activeSubdomain ? "Cabang terikat" : "Global"}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {session.user.permissions?.map((p) => (
              <Badge key={p} variant="secondary" className="capitalize">
                {p.replaceAll("_", " ")}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading">Ubah password</CardTitle>
          <CardDescription>
            Gunakan password kuat minimal 8 karakter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Password saat ini</FieldLabel>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  disabled={isPending}
                  autoComplete="current-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="newPassword">Password baru</FieldLabel>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={8}
                  required
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Konfirmasi password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </Field>
              {state.error ? <FieldError>{state.error}</FieldError> : null}
              {state.success ? (
                <p className="text-sm text-primary">Password berhasil diubah.</p>
              ) : null}
            </FieldGroup>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0 sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

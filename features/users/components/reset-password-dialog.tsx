"use client";

import { useActionState, useEffect } from "react";
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
import {
  resetUserPasswordAction,
  type ResetPasswordState,
} from "@/features/users/actions/reset-user-password";
import type { UserListItem } from "@/features/users/types";

const initialState: ResetPasswordState = {};

type ResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
};

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: ResetPasswordDialogProps) {
  const [state, formAction, isPending] = useActionState(
    resetUserPasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-shell-sm">
        <DialogHeader className="dialog-header-padding">
          <DialogTitle>Atur password</DialogTitle>
          <DialogDescription>
            Set password baru untuk <span className="font-medium text-foreground">{user.username}</span>.
            Pengguna akan login dengan password ini.
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-body-scroll">
          <form action={formAction} id="reset-password-form" className="dialog-form-fields">
            <input type="hidden" name="userId" value={user.id} />
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="reset-password">Password baru</FieldLabel>
                <Input
                  id="reset-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  disabled={isPending}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                />
                <FieldDescription>
                  Password akan disimpan untuk login berikutnya.
                </FieldDescription>
              </Field>
              {state.error ? <FieldError>{state.error}</FieldError> : null}
              {state.success ? (
                <p className="text-sm text-primary">Password berhasil diperbarui.</p>
              ) : null}
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
          <Button type="submit" form="reset-password-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

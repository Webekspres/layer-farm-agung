"use client";

import { useEffect, useState, useTransition } from "react";
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
import { notifyActionResult } from "@/components/shared/action-feedback";
import { deleteUserAction } from "@/features/users/actions/delete-user";
import type { UserListItem } from "@/features/users/types";

type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
};

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) setError(undefined);
  }, [open]);

  if (!user) return null;

  function handleDelete() {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteUserAction(user!.id);
      if (!notifyActionResult(result, { success: "Pengguna berhasil dihapus." })) {
        if (result.error) setError(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-shell-sm">
        <DialogHeader className="dialog-header-padding">
          <DialogTitle>Hapus pengguna</DialogTitle>
          <DialogDescription>
            Akun <span className="font-medium text-foreground">{user.username}</span>{" "}
            ({user.fullName}) akan dihapus permanen dari sistem. Tindakan ini tidak
            dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-body-scroll px-5 pb-2 sm:px-7 md:px-8">
          <p className="text-sm text-muted-foreground">
            Hanya pengguna berstatus <strong className="text-foreground">Nonaktif</strong>{" "}
            yang dapat dihapus. Pastikan pengguna sudah tidak diperlukan.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus permanen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

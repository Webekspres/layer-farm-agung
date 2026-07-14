"use client";

import { useTransition } from "react";
import { KeyRound, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsersPagination } from "@/features/users/components/users-pagination";
import { notifyActionResult } from "@/components/shared/action-feedback";
import { updateUserStatusAction } from "@/features/users/actions/update-user-status";
import type { UserListItem, UsersPaginationMeta } from "@/features/users/types";

type UsersTableProps = {
  users: UserListItem[];
  currentUserId: string;
  pagination: UsersPaginationMeta;
  /** Superadmin sees tenant column; branch admins are scoped to one tenant. */
  showTenantColumn?: boolean;
  onEditUser: (user: UserListItem) => void;
  onResetPassword: (user: UserListItem) => void;
  onDeleteUser: (user: UserListItem) => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({
  users,
  currentUserId,
  pagination,
  showTenantColumn = false,
  onEditUser,
  onResetPassword,
  onDeleteUser,
}: UsersTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(userId: string, checked: boolean) {
    startTransition(async () => {
      const result = await updateUserStatusAction(userId, checked);
      notifyActionResult(result, {
        success: checked
          ? "Pengguna diaktifkan."
          : "Pengguna dinonaktifkan.",
      });
    });
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      {users.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Tidak ada pengguna yang cocok dengan filter saat ini.
        </div>
      ) : (
        <Table containerClassName="overflow-x-auto overscroll-x-contain">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Peran</TableHead>
              {showTenantColumn ? (
                <TableHead className="hidden lg:table-cell">Tenant</TableHead>
              ) : null}
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-foreground">{user.username}</TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-muted-foreground md:table-cell">
                    {user.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.roleName}</Badge>
                  </TableCell>
                  {showTenantColumn ? (
                    <TableCell className="hidden lg:table-cell">
                      {user.tenantName ? (
                        <span className="text-foreground">{user.tenantName}</span>
                      ) : (
                        <Badge variant="outline">Global</Badge>
                      )}
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={user.isActive}
                        disabled={isPending || isSelf}
                        onCheckedChange={(checked) =>
                          handleStatusChange(user.id, checked)
                        }
                        aria-label={`Status ${user.username}`}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Aksi ${user.username}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => onEditUser(user)}>
                            <Pencil className="size-4" />
                            Edit pengguna
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onResetPassword(user)}>
                            <KeyRound className="size-4" />
                            Atur password
                          </DropdownMenuItem>
                          {!user.isActive && !isSelf ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDeleteUser(user)}
                            >
                              <Trash2 className="size-4" />
                              Hapus pengguna
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <UsersPagination {...pagination} />
    </div>
  );
}

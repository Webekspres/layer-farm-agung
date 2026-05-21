"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
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
import { updateUserStatusAction } from "@/features/users/actions/update-user-status";
import type { UserListItem, UsersPaginationMeta } from "@/features/users/types";

type UsersTableProps = {
  users: UserListItem[];
  currentUserId: string;
  pagination: UsersPaginationMeta;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({ users, currentUserId, pagination }: UsersTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(userId: string, checked: boolean) {
    startTransition(async () => {
      await updateUserStatusAction(userId, checked);
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
              <TableHead className="hidden lg:table-cell">Cabang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Dibuat</TableHead>
              <TableHead className="text-right">Aktif</TableHead>
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
                  <TableCell className="hidden lg:table-cell">
                    {user.subdomainName ? (
                      <span className="text-foreground">{user.subdomainName}</span>
                    ) : (
                      <Badge variant="outline">Global</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={user.isActive}
                      disabled={isPending || isSelf}
                      onCheckedChange={(checked) =>
                        handleStatusChange(user.id, checked)
                      }
                      aria-label={`Status ${user.username}`}
                    />
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

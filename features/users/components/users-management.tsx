"use client";

import { useState } from "react";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { EditUserDialog } from "@/features/users/components/edit-user-dialog";
import { ResetPasswordDialog } from "@/features/users/components/reset-password-dialog";
import { UsersTable } from "@/features/users/components/users-table";
import { UsersToolbar } from "@/features/users/components/users-toolbar";
import type {
  UserFormOptions,
  UserListItem,
  UsersPaginationMeta,
} from "@/features/users/types";

type UsersManagementProps = {
  users: UserListItem[];
  formOptions: UserFormOptions;
  currentUserId: string;
  pagination: UsersPaginationMeta;
};

export function UsersManagement({
  users,
  formOptions,
  currentUserId,
  pagination,
}: UsersManagementProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserListItem | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <UsersToolbar
        formOptions={formOptions}
        onCreateClick={() => setCreateOpen(true)}
      />
      <UsersTable
        users={users}
        currentUserId={currentUserId}
        pagination={pagination}
        onEditUser={(user) => {
          setEditingUser(user);
          setEditOpen(true);
        }}
        onResetPassword={(user) => {
          setPasswordUser(user);
          setPasswordOpen(true);
        }}
      />
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        formOptions={formOptions}
      />
      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editingUser}
        formOptions={formOptions}
        isSelf={editingUser?.id === currentUserId}
      />
      <ResetPasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        user={passwordUser}
      />
    </div>
  );
}

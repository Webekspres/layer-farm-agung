"use client";

import { useState } from "react";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
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
      />
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        formOptions={formOptions}
      />
    </div>
  );
}

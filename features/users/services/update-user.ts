import { syncAuthUserIdentity } from "@/features/auth/services/sync-auth-user-identity";

export type UpdateUserData = {
  fullName: string;
  username: string;
  email: string | null;
  roleId: number;
  tenantId: string | null;
  isActive: boolean;
};

export async function updateUserRecord(userId: string, data: UpdateUserData) {
  return syncAuthUserIdentity({
    userId,
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    roleId: data.roleId,
    tenantId: data.tenantId,
    isActive: data.isActive,
  });
}

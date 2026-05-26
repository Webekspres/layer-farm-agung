import prisma from "@/lib/prisma";

export type SyncAuthUserIdentityInput = {
  userId: string;
  fullName: string;
  username: string;
  email: string | null;
  roleId: number;
  tenantId: string | null;
  isActive: boolean;
};

/**
 * Keeps ERD User row aligned with Better Auth login fields (username + email).
 * Credential account password is unchanged here.
 */
export async function syncAuthUserIdentity(input: SyncAuthUserIdentityInput) {
  return prisma.user.update({
    where: { id: input.userId },
    data: {
      full_name: input.fullName,
      username: input.username,
      display_username: input.username,
      email: input.email,
      email_verified: Boolean(input.email),
      role_id: input.roleId,
      tenant_id: input.tenantId,
      is_active: input.isActive,
    },
  });
}

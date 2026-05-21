import prisma from "@/lib/prisma";

export type UpdateUserData = {
  fullName: string;
  username: string;
  email: string | null;
  roleId: number;
  subdomainId: string | null;
  isActive: boolean;
};

export async function updateUserRecord(userId: string, data: UpdateUserData) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      full_name: data.fullName,
      username: data.username,
      display_username: data.username,
      email: data.email,
      email_verified: Boolean(data.email),
      role_id: data.roleId,
      subdomain_id: data.subdomainId,
      is_active: data.isActive,
    },
  });
}

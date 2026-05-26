import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { hashPasswordsForUser } from "@/features/auth/lib/password";

export type CreateUserInput = {
  fullName: string;
  username: string;
  email?: string | null;
  password: string;
  roleId: number;
  tenantId?: string | null;
  isActive?: boolean;
};

/**
 * Provision a user for admin-created accounts (no public registration).
 * Keeps ERD `password_hash` and Better Auth credential account in sync.
 */
export async function createUserWithCredential(input: CreateUserInput) {
  const { credentialHash, passwordHash } = await hashPasswordsForUser(
    input.password,
  );

  const userId = randomUUID();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: userId,
        full_name: input.fullName,
        username: input.username,
        display_username: input.username,
        email: input.email ?? null,
        email_verified: Boolean(input.email),
        password_hash: passwordHash,
        role_id: input.roleId,
        tenant_id: input.tenantId ?? null,
        is_active: input.isActive ?? false,
      },
    });

    await tx.account.create({
      data: {
        id: randomUUID(),
        account_id: userId,
        provider_id: "credential",
        user_id: userId,
        password: credentialHash,
      },
    });

    return user;
  });
}

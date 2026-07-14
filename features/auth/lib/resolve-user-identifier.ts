import prisma from "@/lib/prisma";

export type ResolvedSignInUser = {
  id: string;
  username: string;
  is_active: boolean;
  role: { name: string };
};

/** Resolve login identifier to a user (username exact match, or email case-insensitive). */
export async function findUserBySignInIdentifier(
  identifier: string,
): Promise<ResolvedSignInUser | null> {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    const byEmail = await prisma.user.findFirst({
      where: { email: { equals: trimmed, mode: "insensitive" } },
      select: {
        id: true,
        username: true,
        is_active: true,
        role: { select: { name: true } },
      },
    });
    return byEmail;
  }

  return prisma.user.findUnique({
    where: { username: trimmed },
    select: {
      id: true,
      username: true,
      is_active: true,
      role: { select: { name: true } },
    },
  });
}

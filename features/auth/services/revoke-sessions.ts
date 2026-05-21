import prisma from "@/lib/prisma";

/** Ends all login sessions for one user (e.g. after deactivation). */
export async function revokeAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { user_id: userId } });
}

/**
 * Ends sessions for branch members and superadmin contexts switched to this branch.
 */
export async function revokeAllBranchSessions(subdomainId: string) {
  await prisma.session.deleteMany({
    where: {
      OR: [
        { user: { subdomain_id: subdomainId } },
        { active_subdomain_id: subdomainId },
      ],
    },
  });
}

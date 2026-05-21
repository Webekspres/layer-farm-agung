"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireGlobalAdmin } from "@/features/auth/lib/require-permission";
import { getServerSession } from "@/features/auth/lib/session";

export async function switchActiveSubdomainAction(subdomainId: string | null) {
  const session = await getServerSession();
  if (!session) {
    return { error: "Sesi tidak ditemukan." };
  }

  requireGlobalAdmin(session);

  if (subdomainId) {
    const branch = await prisma.subdomain.findFirst({
      where: { id: subdomainId, is_active: true },
    });
    if (!branch) {
      return { error: "Cabang tidak ditemukan atau nonaktif." };
    }
  }

  const sessionId = session.session.id;
  if (!sessionId) {
    return { error: "ID sesi tidak valid." };
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { active_subdomain_id: subdomainId },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireGlobalAdmin } from "@/features/auth/lib/require-permission";
import { getServerSession } from "@/features/auth/lib/session";

export async function switchActiveTenantAction(tenantId: string | null) {
  const session = await getServerSession();
  if (!session) {
    return { error: "Sesi tidak ditemukan." };
  }

  requireGlobalAdmin(session);

  if (tenantId) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, is_active: true },
    });
    if (!tenant) {
      return { error: "Tenant tidak ditemukan atau nonaktif." };
    }
  }

  const sessionId = session.session.id;
  if (!sessionId) {
    return { error: "ID sesi tidak valid." };
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { active_tenant_id: tenantId },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

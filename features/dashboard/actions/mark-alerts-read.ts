"use server";

import { revalidatePath } from "next/cache";
import { getActiveTenantId } from "@/features/auth/lib/session";
import { requirePermission } from "@/features/auth/lib/require-permission";
import prisma from "@/lib/prisma";

export async function markDashboardAlertsReadAction() {
  const session = await requirePermission("view_dashboard");
  const tenantId = getActiveTenantId(session);

  if (!tenantId) {
    return;
  }

  await prisma.alertLog.updateMany({
    where: {
      tenant_id: tenantId,
      is_read: false,
    },
    data: {
      is_read: true,
    },
  });

  revalidatePath("/dashboard");
}

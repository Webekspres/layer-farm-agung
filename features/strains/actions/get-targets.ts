"use server";

import prisma from "@/lib/prisma";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";

export async function getProductionTargetsAction(strainId: number) {
  await requireManageGlobalCatalogSession();
  
  return prisma.productionTarget.findMany({
    where: { strain_id: strainId },
    orderBy: { age_in_weeks: "asc" },
  });
}

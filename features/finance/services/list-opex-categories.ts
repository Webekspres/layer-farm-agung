import prisma from "@/lib/prisma";
import { ensureDefaultOpexCategory } from "@/features/finance/services/ensure-default-opex-category";
import type { OpexCategoryOption } from "@/features/finance/types";

export async function listOpexCategories(
  tenantId: string,
): Promise<OpexCategoryOption[]> {
  await ensureDefaultOpexCategory(tenantId);

  const rows = await prisma.opexCategory.findMany({
    where: { tenant_id: tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return rows;
}

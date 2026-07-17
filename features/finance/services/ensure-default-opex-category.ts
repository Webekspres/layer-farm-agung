import prisma from "@/lib/prisma";
import { DEFAULT_OPEX_CATEGORY_NAME } from "@/features/finance/lib/cashflow-labels";

/**
 * Guarantees the tenant has at least one opex category so the expense form
 * always has a selectable default on first use.
 */
export async function ensureDefaultOpexCategory(tenantId: string) {
  const existing = await prisma.opexCategory.findFirst({
    where: { tenant_id: tenantId, name: DEFAULT_OPEX_CATEGORY_NAME },
    select: { id: true, name: true },
  });

  if (existing) return existing;

  return prisma.opexCategory.create({
    data: { tenant_id: tenantId, name: DEFAULT_OPEX_CATEGORY_NAME },
    select: { id: true, name: true },
  });
}

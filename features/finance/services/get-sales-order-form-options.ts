import prisma from "@/lib/prisma";
import { listCustomers } from "@/features/finance/services/list-customers";
import type { SalesOrderFormOptions } from "@/features/finance/types";

export async function getSalesOrderFormOptions(
  tenantId: string,
): Promise<SalesOrderFormOptions> {
  const eggItem = await prisma.item.findFirst({
    where: { tenant_id: tenantId, type: "Egg" },
    select: { id: true },
  });

  const [customers, eggGrades, locations] = await Promise.all([
    listCustomers(tenantId),
    prisma.eggGrade.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { tenant_id: tenantId },
      select: {
        id: true,
        name: true,
        inventory_stocks: eggItem
          ? {
              where: { item_id: eggItem.id },
              select: { quantity: true },
              take: 1,
            }
          : false,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    customers: customers.items.map((c) => ({ id: c.id, name: c.name })),
    eggGrades,
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      eggStock:
        "inventory_stocks" in loc && Array.isArray(loc.inventory_stocks)
          ? (loc.inventory_stocks[0]?.quantity ?? 0)
          : 0,
    })),
  };
}

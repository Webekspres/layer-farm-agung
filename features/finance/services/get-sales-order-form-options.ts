import prisma from "@/lib/prisma";
import { listCustomers } from "@/features/finance/services/list-customers";
import type { SalesOrderFormOptions } from "@/features/finance/types";

export async function getSalesOrderFormOptions(
  tenantId: string,
): Promise<SalesOrderFormOptions> {
  const [customers, eggGrades] = await Promise.all([
    listCustomers(tenantId),
    prisma.eggGrade.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    customers: customers.items.map((c) => ({ id: c.id, name: c.name })),
    eggGrades,
  };
}

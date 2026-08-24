import prisma from "@/lib/prisma";
import { listCustomers } from "@/features/finance/services/list-customers";
import type { SalesOrderFormOptions } from "@/features/finance/types";

export async function getSalesOrderFormOptions(
  tenantId: string,
): Promise<SalesOrderFormOptions> {
  const [customers, eggGrades, locations] = await Promise.all([
    listCustomers(tenantId),
    prisma.eggGrade.findMany({
      where: { is_active: true },
      select: { id: true, name: true },
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    }),
    prisma.location.findMany({
      where: { tenant_id: tenantId },
      select: {
        id: true,
        name: true,
        egg_stocks: {
          select: {
            egg_grade_id: true,
            quantity: true,
            egg_grade: { select: { name: true } },
          },
        },
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
      eggStockByGrade: loc.egg_stocks.map((stock) => ({
        gradeId: stock.egg_grade_id,
        gradeName: stock.egg_grade.name,
        quantity: stock.quantity,
      })),
    })),
  };
}

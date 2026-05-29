import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { VendorListItem, VendorsListFilters } from "@/features/vendors/types";

function buildWhere(
  tenantId: string,
  { search, category }: VendorsListFilters,
): Prisma.VendorWhereInput {
  const where: Prisma.VendorWhereInput = { tenant_id: tenantId };

  if (category) {
    where.category = category;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listVendors(
  tenantId: string,
  filters: VendorsListFilters = {},
): Promise<VendorListItem[]> {
  const rows = await prisma.vendor.findMany({
    where: buildWhere(tenantId, filters),
    include: {
      _count: { select: { supplier_contacts: true, purchase_orders: true } },
      supplier_contacts: {
        take: 1,
        orderBy: { pic_name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    contactCount: row._count.supplier_contacts,
    purchaseOrderCount: row._count.purchase_orders,
    picName: row.supplier_contacts[0]?.pic_name ?? null,
    picPhone: row.supplier_contacts[0]?.phone ?? null,
    createdAt: row.created_at.toISOString(),
  }));
}

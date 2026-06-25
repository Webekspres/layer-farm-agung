import prisma from "@/lib/prisma";

export type FeedItemOption = {
  id: string;
  name: string;
  unit: string;
};

/**
 * Returns items of type "Pakan" or "Feed" for the given tenant.
 * Used by mobile dropdown when selecting which feed was consumed.
 */
export async function listFeedItems(
  tenantId: string,
): Promise<FeedItemOption[]> {
  const items = await prisma.item.findMany({
    where: {
      tenant_id: tenantId,
      OR: [
        { type: { equals: "Pakan", mode: "insensitive" } },
        { type: { equals: "Feed", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, unit: true },
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
  }));
}

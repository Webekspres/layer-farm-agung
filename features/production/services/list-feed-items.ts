import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";

export type FeedItemOption = {
  id: string;
  name: string;
  unit: string;
};

/**
 * Returns items of type Feed for the given tenant.
 * Used by mobile dropdown when selecting which feed was consumed.
 *
 * @deprecated Legacy endpoint. Prefer `GET /api/v1/items?type=Feed`
 * (`listItemsForCage`), which also returns available stock. Kept for
 * backward compatibility.
 */
export async function listFeedItems(
  tenantId: string,
): Promise<FeedItemOption[]> {
  const items = await prisma.item.findMany({
    where: {
      tenant_id: tenantId,
      type: ItemType.Feed,
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

import type { PurchaseOrderFormOptions } from "@/features/procurement/types";
import { listItems } from "@/features/inventory/services/list-items";
import { listLocations } from "@/features/locations/services/list-locations";
import { listVendors } from "@/features/vendors/services/list-vendors";

export async function getPurchaseOrderFormOptions(
  tenantId: string,
): Promise<PurchaseOrderFormOptions> {
  const [vendors, items, locations] = await Promise.all([
    listVendors(tenantId),
    listItems(tenantId),
    listLocations(tenantId),
  ]);

  return {
    vendors: vendors.items.map((v) => ({ id: v.id, name: v.name })),
    items: items.items.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
    })),
    locations: locations.items.map((l) => ({ id: l.id, name: l.name })),
  };
}

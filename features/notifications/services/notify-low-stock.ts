import prisma from "@/lib/prisma";
import { createAppNotification } from "@/features/notifications/services/create-app-notification";
import { listTenantAdminUsers } from "@/features/notifications/services/notification-receivers";

/**
 * Generator stok rendah: item saprodi dengan `min_stock_alert` yang total
 * stoknya (semua lokasi) sudah di bawah ambang. Penerima: admin tenant.
 */
export async function notifyLowStock() {
  const items = await prisma.item.findMany({
    where: {
      min_stock_alert: { not: null },
    },
    select: {
      id: true,
      tenant_id: true,
      name: true,
      unit: true,
      min_stock_alert: true,
      inventory_stocks: {
        select: { quantity: true },
      },
    },
  });

  const lowItems = items.filter(
    (item) =>
      item.min_stock_alert !== null &&
      item.inventory_stocks.reduce((sum, stock) => sum + stock.quantity, 0) <
        item.min_stock_alert,
  );

  const byTenant = new Map<string, typeof lowItems>();
  for (const item of lowItems) {
    const bucket = byTenant.get(item.tenant_id) ?? [];
    bucket.push(item);
    byTenant.set(item.tenant_id, bucket);
  }

  let created = 0;
  for (const [tenantId, tenantItems] of byTenant) {
    const admins = await listTenantAdminUsers(tenantId);

    for (const item of tenantItems) {
      const total = item.inventory_stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );

      for (const admin of admins) {
        await createAppNotification({
          tenantId,
          userId: admin.id,
          type: "LOW_STOCK",
          title: "Stok saprodi rendah",
          body: `${item.name}: tersisa ${total.toLocaleString("id-ID")} ${item.unit}, di bawah minimum ${item.min_stock_alert!.toLocaleString("id-ID")} ${item.unit}.`,
          data: {
            itemId: item.id,
            itemName: item.name,
            critical: true,
          },
          dedupeKey: `lowstock:${item.id}:${admin.id}`,
        });
        created++;
      }
    }
  }

  return { created };
}
import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { listItemsForCage } from "@/features/inventory/services/list-items-for-cage";
import { ItemType } from "@/generated/prisma/enums";

// Item types staff/mobile may read for operational pickers. Vaccine is
// intentionally excluded (belongs to the future Vaksinasi menu, Module 13).
const READABLE_TYPES = new Set<string>([
  ItemType.Feed,
  ItemType.Medicine,
  ItemType.Vitamin,
]);

export async function GET(request: NextRequest) {
  // Staff read — keep on manage_production (do NOT require manage_inventory).
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const url = new URL(request.url);
  const rawTypes = url.searchParams.get("type");
  const cageId = url.searchParams.get("cageId") ?? undefined;

  if (!rawTypes) {
    return apiValidationError("Parameter 'type' wajib diisi.");
  }

  const types = rawTypes
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const invalid = types.filter((t) => !READABLE_TYPES.has(t));
  if (types.length === 0 || invalid.length > 0) {
    return apiValidationError(
      "Parameter 'type' harus salah satu dari: Feed, Medicine, Vitamin.",
    );
  }

  try {
    const items = await listItemsForCage(auth.tenantId, {
      types: types as (typeof ItemType)[keyof typeof ItemType][],
      cageId,
    });
    return apiSuccess(items, "Daftar item berhasil diambil.");
  } catch {
    return apiError("Gagal mengambil daftar item.", 500);
  }
}

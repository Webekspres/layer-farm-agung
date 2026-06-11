import { parseCageQrPayload } from "@/features/cages/lib/parse-cage-qr-payload";
import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { resolveCageByIdentifier } from "@/features/cages/services/resolve-cage-by-identifier";
import type { CageForProduction } from "@/features/production/services/get-cage-for-production";
import { getCageForProduction } from "@/features/production/services/get-cage-for-production";

export type VerifyCageScanResult =
  | { ok: true; cage: CageForProduction }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function verifyCageScan(
  tenantId: string,
  userId: string,
  rawPayload: string,
): Promise<VerifyCageScanResult> {
  const identifier = parseCageQrPayload(rawPayload);

  if (!identifier) {
    return {
      ok: false,
      error: "Kode QR tidak valid. Scan label resmi di pintu kandang.",
      status: 400,
    };
  }

  const resolved = await resolveCageByIdentifier(tenantId, identifier);

  if (!resolved) {
    return {
      ok: false,
      error: "Kandang tidak ditemukan di cabang Anda.",
      status: 404,
    };
  }

  const assigned = await isUserAssignedToCage(userId, resolved.id);

  if (!assigned) {
    return {
      ok: false,
      error: "Anda tidak ditugaskan ke kandang ini. Hubungi admin cabang.",
      status: 403,
    };
  }

  if (resolved.status !== "Active") {
    return {
      ok: false,
      error: "Kandang tidak aktif. Tidak dapat input produksi.",
      status: 403,
    };
  }

  const cage = await getCageForProduction(tenantId, resolved.id);

  if (!cage) {
    return {
      ok: false,
      error: "Kandang tidak ditemukan di cabang Anda.",
      status: 404,
    };
  }

  if (!cage.hasActiveCycle) {
    return {
      ok: false,
      error:
        "Kandang sedang rehat — tidak ada periode produksi aktif. Hubungi admin untuk memulai siklus baru.",
      status: 403,
    };
  }

  return { ok: true, cage };
}

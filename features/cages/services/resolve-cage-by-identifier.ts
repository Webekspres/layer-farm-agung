import { resolveCageByIdentifierRaw } from "@/features/cages/lib/cage-staff-db";

type ResolvedCage = {
  id: string;
  qr_code: string;
  status: string;
  tenant_id: string;
};

/** Resolve cage by UUID or `qr_code` within tenant scope. */
export async function resolveCageByIdentifier(
  tenantId: string,
  identifier: string,
): Promise<ResolvedCage | null> {
  const row = await resolveCageByIdentifierRaw(tenantId, identifier);

  if (!row) return null;

  return {
    id: row.id,
    qr_code: row.qr_code,
    status: row.status,
    tenant_id: tenantId,
  };
}

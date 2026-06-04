import prisma from "@/lib/prisma";
import { FieldProfilePanel } from "@/features/production/components/field-profile-panel";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";

export default async function FieldProfilePage() {
  const session = await requireManageProductionSession();
  const { tenantId } = getProductionTenantScope(session);

  const tenantName = tenantId
    ? await prisma.tenant
        .findUnique({
          where: { id: tenantId },
          select: { brand_name: true, name: true },
        })
        .then((t) => t?.brand_name ?? t?.name ?? null)
    : null;

  return <FieldProfilePanel session={session} tenantName={tenantName} />;
}

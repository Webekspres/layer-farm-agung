import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { getActiveTenantId } from "@/features/auth/lib/session";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import { InputControlSettingsForm } from "@/features/production/components/input-control-settings-form";
import { getProductionInputSetting } from "@/features/production/services/get-production-input-setting";

export default async function InputControlSettingsPage() {
  const session = await requirePermission("manage_production");

  if (session.user.roleName === STAFF_ROLE_NAME) {
    return (
      <>
        <PageHeader
          title="Kebijakan input"
          description="Pengaturan batas input & koreksi tanggal."
        />
        <p className="text-sm text-muted-foreground">
          Halaman ini hanya untuk administrator. Hubungi admin tenant Anda
          untuk mengubah kebijakan input.
        </p>
      </>
    );
  }

  const tenantId = getActiveTenantId(session);

  return (
    <>
      <PageHeader
        title="Kebijakan input"
        description="Atur batas hari input & koreksi tanggal untuk staf lapangan dan administrator."
      />
      <Suspense fallback={null}>
        {tenantId ? (
          <InputControlSettingsForm
            setting={await getProductionInputSetting(tenantId)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Pilih tenant aktif terlebih dahulu untuk mengatur kebijakan input.
          </p>
        )}
      </Suspense>
    </>
  );
}

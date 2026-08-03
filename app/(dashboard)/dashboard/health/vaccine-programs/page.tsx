import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { VaccineProgramsManagement } from "@/features/health/components/vaccine-programs-management";
import { listVaccinePrograms } from "@/features/health/services/list-vaccine-programs";
import {
  getVaccineProgramDetail,
  getVaccineProgramFormOptions,
} from "@/features/health/services/get-vaccine-program-form-options";

export default async function VaccineProgramsPage() {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const programs = hasTenant ? await listVaccinePrograms(tenantId!) : [];
  const formOptions = hasTenant
    ? await getVaccineProgramFormOptions(tenantId!)
    : { strains: [], items: [] };
  const programDetails = hasTenant
    ? (
        await Promise.all(
          programs.map((p) => getVaccineProgramDetail(tenantId!, p.id)),
        )
      ).filter((d): d is NonNullable<typeof d> => Boolean(d))
    : [];

  return (
    <>
      <PageHeader
        title="Program vaksin"
        description="Master langkah vaksin berdasarkan umur siklus (hari). Generate otomatis ke jadwal operasional saat siklus dimulai."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <VaccineProgramsManagement
            programs={programs}
            formOptions={formOptions}
            programDetails={programDetails}
          />
        </Suspense>
      )}
    </>
  );
}

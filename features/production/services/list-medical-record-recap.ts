import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type MedicalRecordRecapRow = {
  id: string;
  treatmentDate: Date;
  cageName: string;
  locationName: string;
  indication: string;
  sickPopulation: number;
  mortalityCount: number;
  medicineName: string;
  dosageAndDuration: string;
  applicationMethod: string;
  treatmentNotes: string | null;
  recordedBy: string;
  createdAt: Date;
};

export async function listMedicalRecordRecap(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<MedicalRecordRecapRow[]> {
  const rows = await prisma.medicalRecord.findMany({
    where: {
      cage: { location: { tenant_id: tenantId } },
      treatment_date: recordDate,
    },
    include: {
      cage: {
        select: {
          name: true,
          location: { select: { name: true } },
        },
      },
      user: { select: { full_name: true, username: true } },
    },
    orderBy: [{ cage: { name: "asc" } }, { created_at: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    treatmentDate: row.treatment_date,
    cageName: row.cage.name,
    locationName: row.cage.location.name,
    indication: row.indication,
    sickPopulation: row.sick_population,
    mortalityCount: row.mortality_count,
    medicineName: row.medicine_name,
    dosageAndDuration: row.dosage_and_duration,
    applicationMethod: row.application_method,
    treatmentNotes: row.treatment_notes,
    recordedBy: row.user.full_name || row.user.username,
    createdAt: row.created_at,
  }));
}

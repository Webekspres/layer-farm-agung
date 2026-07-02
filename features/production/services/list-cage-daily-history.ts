import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type CageProductionHistoryItem = {
  id: string;
  tb: number;
  tr: number;
  tp: number;
  total: number;
  recordedBy: string;
  createdAt: Date;
};

export type CageFeedHistoryItem = {
  id: string;
  itemName: string;
  itemUnit: string;
  quantity: number;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
};

export type CagePopulationHistoryItem = {
  id: string;
  mutationType: string;
  quantity: number;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
};

export type CageMedicalHistoryItem = {
  id: string;
  indication: string;
  sickPopulation: number;
  mortalityCount: number;
  medicineName: string;
  itemName: string | null;
  itemUnit: string | null;
  quantityUsed: number | null;
  dosageAndDuration: string;
  applicationMethod: string;
  treatmentNotes: string | null;
  recordedBy: string;
  createdAt: Date;
};

export type CageDailyHistory = {
  recordDate: Date;
  cageId: string;
  cageName: string;
  locationName: string;
  productions: CageProductionHistoryItem[];
  feed: CageFeedHistoryItem[];
  population: CagePopulationHistoryItem[];
  medical: CageMedicalHistoryItem[];
};

export async function listCageDailyHistory(
  tenantId: string,
  userId: string,
  cageId: string,
  recordDate = startOfTodayUtc(),
): Promise<CageDailyHistory | null> {
  const assigned = await isUserAssignedToCage(userId, cageId);

  if (!assigned) {
    return null;
  }

  const cage = await prisma.cage.findFirst({
    where: {
      id: cageId,
      location: { tenant_id: tenantId },
    },
    select: {
      id: true,
      name: true,
      location: { select: { name: true } },
    },
  });

  if (!cage) {
    return null;
  }

  const [productions, feedRows, populationRows, medicalRows] =
    await Promise.all([
      prisma.dailyProduction.findMany({
        where: {
          tenant_id: tenantId,
          cage_id: cageId,
          record_date: recordDate,
        },
        include: {
          user: { select: { full_name: true, username: true } },
        },
        orderBy: { created_at: "asc" },
      }),
      prisma.feedConsumption.findMany({
        where: {
          tenant_id: tenantId,
          cage_id: cageId,
          record_date: recordDate,
        },
        include: {
          item: { select: { name: true, unit: true } },
          user: { select: { full_name: true, username: true } },
        },
        orderBy: { created_at: "asc" },
      }),
      prisma.populationMutation.findMany({
        where: {
          cage_id: cageId,
          record_date: recordDate,
        },
        include: {
          user: { select: { full_name: true, username: true } },
        },
        orderBy: { created_at: "asc" },
      }),
      prisma.medicalRecord.findMany({
        where: {
          cage_id: cageId,
          treatment_date: recordDate,
        },
        include: {
          item: { select: { name: true, unit: true } },
          user: { select: { full_name: true, username: true } },
        },
        orderBy: { created_at: "asc" },
      }),
    ]);

  return {
    recordDate,
    cageId: cage.id,
    cageName: cage.name,
    locationName: cage.location.name,
    productions: productions.map((row) => ({
      id: row.id,
      tb: row.tb,
      tr: row.tr,
      tp: row.tp,
      total: row.tb + row.tr + row.tp,
      recordedBy: row.user.full_name || row.user.username,
      createdAt: row.created_at,
    })),
    feed: feedRows.map((row) => ({
      id: row.id,
      itemName: row.item.name,
      itemUnit: row.item.unit,
      quantity: row.quantity,
      notes: row.notes,
      recordedBy: row.user.full_name || row.user.username,
      createdAt: row.created_at,
    })),
    population: populationRows.map((row) => ({
      id: row.id,
      mutationType: row.mutation_type,
      quantity: row.quantity,
      notes: row.notes,
      recordedBy: row.user.full_name || row.user.username,
      createdAt: row.created_at,
    })),
    medical: medicalRows.map((row) => ({
      id: row.id,
      indication: row.indication,
      sickPopulation: row.sick_population,
      mortalityCount: row.mortality_count,
      medicineName: row.medicine_name,
      itemName: row.item?.name ?? null,
      itemUnit: row.item?.unit ?? null,
      quantityUsed: row.quantity_used,
      dosageAndDuration: row.dosage_and_duration,
      applicationMethod: row.application_method,
      treatmentNotes: row.treatment_notes,
      recordedBy: row.user.full_name || row.user.username,
      createdAt: row.created_at,
    })),
  };
}

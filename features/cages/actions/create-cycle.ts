"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { createCycleSchema } from "@/features/cages/schemas/cycle";
import { generateVaccineSchedulesForCycle } from "@/features/health/services/generate-vaccine-schedules-for-cycle";

export type ActionState = {
  error?: string;
  success?: boolean;
  /** Info tambahan (mis. hasil generate jadwal vaksin). */
  message?: string;
};

export async function createCycleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireManageMasterDataSession();
  const { tenantId } = getMasterDataTenantScope(session);

  if (!tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const rawCageId = formData.get("cageId");
  const rawStartDate = formData.get("startDate");
  const rawInitialPopulation = formData.get("initialPopulation");

  const parsed = createCycleSchema.safeParse({
    cageId: rawCageId,
    startDate: rawStartDate,
    initialPopulation: rawInitialPopulation,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { cageId, startDate, initialPopulation } = parsed.data;

  // Verify cage exists under the tenant and get capacity
  const cage = await prisma.cage.findFirst({
    where: {
      id: cageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, capacity: true },
  });

  if (!cage) {
    return { error: "Kandang tidak ditemukan." };
  }

  // Validate initial population against cage capacity
  if (initialPopulation > cage.capacity) {
    return {
      error: `Populasi awal tidak boleh melebihi kapasitas kandang (${cage.capacity} ekor).`,
    };
  }

  // Verify no active cycle exists
  const activeCycle = await prisma.cycleSetting.findFirst({
    where: {
      cage_id: cageId,
      status: "Active",
    },
    select: { id: true },
  });

  if (activeCycle) {
    return { error: "Kandang sudah memiliki siklus yang aktif berjalan." };
  }

  try {
    await prisma.cycleSetting.create({
      data: {
        cage_id: cageId,
        start_date: startDate,
        initial_population: initialPopulation,
        status: "Active",
      },
    });
  } catch {
    return { error: "Gagal memulai siklus baru." };
  }

  let vaccineMessage: string | undefined;
  try {
    const generated = await generateVaccineSchedulesForCycle(
      tenantId,
      cageId,
      startDate,
    );
    if (!generated.ok) {
      vaccineMessage = `Siklus dibuat, tetapi generate jadwal vaksin gagal: ${generated.error}`;
    } else if (generated.info) {
      vaccineMessage = generated.info;
    } else if (generated.created > 0) {
      vaccineMessage = `${generated.created} jadwal vaksin digenerate dari program${
        generated.programName ? ` “${generated.programName}”` : ""
      }.`;
    }
  } catch {
    vaccineMessage =
      "Siklus dibuat, tetapi generate jadwal vaksin mengalami kesalahan tak terduga.";
  }

  revalidatePath(`/dashboard/cages/${cageId}`);
  revalidatePath("/dashboard/cages");
  revalidatePath("/dashboard/health/vaccines");
  return { success: true, message: vaccineMessage };
}

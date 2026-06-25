import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type { PopulationMutationInput } from "@/features/production/schemas/population-mutation";
import prisma from "@/lib/prisma";

export type RecordPopulationMutationResult =
  | { ok: true }
  | { ok: false; error: string };

function startOfUtcDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export async function recordPopulationMutation(
  tenantId: string,
  userId: string,
  input: PopulationMutationInput,
): Promise<RecordPopulationMutationResult> {
  // Verify cage belongs to this tenant
  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, status: true },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  // Verify user is assigned to this cage
  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

  if (cage.status !== "Active") {
    return { ok: false, error: "Kandang tidak aktif." };
  }

  const recordDate = startOfUtcDate(input.recordDate);

  try {
    await prisma.populationMutation.create({
      data: {
        cage_id: input.cageId,
        user_id: userId,
        mutation_type: input.mutationType,
        quantity: input.quantity,
        notes: input.notes ?? null,
        record_date: recordDate,
        is_synced: true,
      },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan mutasi populasi." };
  }

  return { ok: true };
}

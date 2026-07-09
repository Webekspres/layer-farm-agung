import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type { UpdatePopulationMutationInput } from "@/features/production/schemas/update-population-mutation";
import {
  validatePopulationMutationUpdate,
} from "@/features/production/services/record-population-mutation";
import prisma from "@/lib/prisma";

export type UpdatePopulationMutationResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function updatePopulationMutation(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdatePopulationMutationInput,
): Promise<UpdatePopulationMutationResult> {
  const existing = await prisma.populationMutation.findFirst({
    where: { id: recordId, cage: { location: { tenant_id: tenantId } } },
    select: { id: true, cage_id: true, record_date: true },
  });

  if (!existing) {
    return {
      ok: false,
      error: "Catatan mutasi populasi tidak ditemukan.",
      status: 404,
    };
  }

  const assigned = await isUserAssignedToCage(userId, existing.cage_id);

  if (!assigned) {
    return {
      ok: false,
      error: "Anda tidak ditugaskan ke kandang ini.",
      status: 403,
    };
  }

  const validation = await validatePopulationMutationUpdate(
    existing.cage_id,
    recordId,
    input.mutationType,
    input.quantity,
    existing.record_date,
  );

  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 };
  }

  try {
    await prisma.populationMutation.update({
      where: { id: recordId },
      data: {
        mutation_type: input.mutationType,
        quantity: input.quantity,
        notes: input.notes ?? null,
      },
    });
  } catch {
    return {
      ok: false,
      error: "Gagal memperbarui mutasi populasi.",
      status: 400,
    };
  }

  return { ok: true };
}

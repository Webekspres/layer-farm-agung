import prisma from "@/lib/prisma";

export type DeactivateVaccineProgramResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deactivateVaccineProgram(
  tenantId: string,
  programId: string,
): Promise<DeactivateVaccineProgramResult> {
  const existing = await prisma.vaccineProgram.findFirst({
    where: { id: programId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, error: "Program vaksin tidak ditemukan." };
  }

  try {
    await prisma.vaccineProgram.update({
      where: { id: programId },
      data: { is_active: false },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menonaktifkan program vaksin." };
  }
}

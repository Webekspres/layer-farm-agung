import prisma from "@/lib/prisma";
import { isUuid } from "@/lib/uuid";

/** Raw SQL helpers — used until `prisma generate` succeeds after schema changes. */

export async function getCageQrCode(cageId: string): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ qr_code: string }[]>`
    SELECT qr_code FROM "Cage" WHERE id = ${cageId}::uuid LIMIT 1
  `;
  return rows[0]?.qr_code ?? null;
}

export async function getAssignedStaffIds(cageId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ user_id: string }[]>`
    SELECT user_id FROM cage_staff_assignment WHERE cage_id = ${cageId}::uuid
  `;
  return rows.map((row) => row.user_id);
}

export async function isUserAssignedToCageRaw(
  userId: string,
  cageId: string,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ cage_id: string }[]>`
    SELECT cage_id FROM cage_staff_assignment
    WHERE cage_id = ${cageId}::uuid AND user_id = ${userId}::uuid
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function getAssignedCageIdsForUser(
  userId: string,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ cage_id: string }[]>`
    SELECT cage_id FROM cage_staff_assignment WHERE user_id = ${userId}::uuid
  `;
  return rows.map((row) => row.cage_id);
}

type ResolvedCageRow = {
  id: string;
  qr_code: string;
  status: string;
};

export async function resolveCageByIdentifierRaw(
  tenantId: string,
  identifier: string,
): Promise<ResolvedCageRow | null> {
  const rows = isUuid(identifier)
    ? await prisma.$queryRaw<ResolvedCageRow[]>`
        SELECT c.id, c.qr_code, c.status
        FROM "Cage" c
        INNER JOIN "Location" l ON l.id = c.location_id
        WHERE c.id = ${identifier}::uuid AND l.tenant_id = ${tenantId}::uuid
        LIMIT 1
      `
    : await prisma.$queryRaw<ResolvedCageRow[]>`
        SELECT c.id, c.qr_code, c.status
        FROM "Cage" c
        INNER JOIN "Location" l ON l.id = c.location_id
        WHERE c.qr_code = ${identifier.toUpperCase()} AND l.tenant_id = ${tenantId}::uuid
        LIMIT 1
      `;

  return rows[0] ?? null;
}

export async function setCageQrCode(
  cageId: string,
  qrCode: string,
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Cage" SET qr_code = ${qrCode} WHERE id = ${cageId}::uuid
  `;
}

export async function replaceCageStaffAssignments(
  cageId: string,
  staffIds: string[],
): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM cage_staff_assignment WHERE cage_id = ${cageId}::uuid
  `;

  for (const userId of staffIds) {
    await prisma.$executeRaw`
      INSERT INTO cage_staff_assignment (cage_id, user_id)
      VALUES (${cageId}::uuid, ${userId}::uuid)
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function upsertCageStaffAssignment(
  cageId: string,
  userId: string,
): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO cage_staff_assignment (cage_id, user_id)
    VALUES (${cageId}::uuid, ${userId}::uuid)
    ON CONFLICT (cage_id, user_id) DO NOTHING
  `;
}

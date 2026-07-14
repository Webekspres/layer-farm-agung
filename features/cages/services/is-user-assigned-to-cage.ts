import { isUserAssignedToCageRaw } from "@/features/cages/lib/cage-staff-db";

export async function isUserAssignedToCage(
  userId: string,
  cageId: string,
): Promise<boolean> {
  return isUserAssignedToCageRaw(userId, cageId);
}

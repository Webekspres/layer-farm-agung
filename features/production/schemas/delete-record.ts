import { z } from "zod";

import { correctionMetaFields } from "@/features/production/schemas/correction-meta";

/**
 * Body untuk endpoint DELETE komponen input harian. Penghapusan adalah bentuk
 * koreksi: wajib `reason` (audit append-only) dan opsional `clientMutationId`
 * untuk idempotency — konsisten dengan PATCH koreksi.
 */
export const deleteRecordSchema = z.object({
  ...correctionMetaFields,
});

export type DeleteRecordInput = z.infer<typeof deleteRecordSchema>;

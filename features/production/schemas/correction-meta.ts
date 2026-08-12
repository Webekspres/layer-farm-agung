import { z } from "zod";
import { optionalClientMutationIdSchema } from "@/features/production/lib/client-mutation-id";

export const correctionReasonSchema = z
  .string()
  .trim()
  .min(3, "Alasan koreksi wajib diisi (minimal 3 karakter).")
  .max(500, "Alasan koreksi maksimal 500 karakter.");

export const correctionMetaFields = {
  reason: correctionReasonSchema,
  clientMutationId: optionalClientMutationIdSchema,
};

export type CorrectionChange = {
  component: "production" | "feed" | "population" | "medical";
  recordId: string;
  field: string;
  before: string | number | null;
  after: string | number | null;
};

import { z } from "zod";

export const optionalClientMutationIdSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().uuid("clientMutationId tidak valid.").optional(),
);

export const optionalFromSyncSchema = z
  .preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.boolean().optional(),
  )
  .default(false);

export const idempotentPostFields = {
  clientMutationId: optionalClientMutationIdSchema,
  fromSync: optionalFromSyncSchema,
};

export function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

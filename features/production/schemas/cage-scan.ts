import { z } from "zod";

export const cageScanSchema = z.object({
  payload: z
    .string()
    .trim()
    .min(1, "Payload QR wajib diisi."),
});

export type CageScanInput = z.infer<typeof cageScanSchema>;

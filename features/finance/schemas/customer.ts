import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter.").max(200),
  phone: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().trim().max(30, "Nomor telepon maksimal 30 karakter.").optional(),
  ),
  address: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().trim().max(300, "Alamat maksimal 300 karakter.").optional(),
  ),
});

export type CustomerInput = z.infer<typeof customerSchema>;

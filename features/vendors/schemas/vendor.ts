import { z } from "zod";

export const vendorCategories = ["Pakan", "Obat", "Perlengkapan", "Lainnya"] as const;

export const vendorSchema = z.object({
  name: z.string().trim().min(2, "Nama vendor minimal 2 karakter."),
  category: z.enum(vendorCategories, {
    message: "Pilih kategori vendor.",
  }),
  address: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const updateVendorSchema = vendorSchema.extend({
  id: z.string().uuid(),
});

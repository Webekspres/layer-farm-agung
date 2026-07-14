import { z } from "zod";

export const vendorCategories = ["Pakan", "Obat", "Perlengkapan", "Lainnya"] as const;

function refinePicFields(
  data: { picName?: string; picPhone?: string },
  ctx: z.RefinementCtx,
) {
  const hasName = Boolean(data.picName?.trim());
  const hasPhone = Boolean(data.picPhone?.trim());

  if (hasName && !hasPhone) {
    ctx.addIssue({
      code: "custom",
      message: "Nomor telepon PIC wajib diisi jika nama PIC diisi.",
      path: ["picPhone"],
    });
  }
}

export const vendorSchema = z
  .object({
    name: z.string().trim().min(2, "Nama vendor minimal 2 karakter."),
    category: z.enum(vendorCategories, {
      message: "Pilih kategori vendor.",
    }),
    address: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    picName: z.string().trim().optional(),
    picPhone: z.string().trim().optional(),
  })
  .superRefine(refinePicFields);

export const updateVendorSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(2, "Nama vendor minimal 2 karakter."),
    category: z.enum(vendorCategories, {
      message: "Pilih kategori vendor.",
    }),
    address: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    picName: z.string().trim().optional(),
    picPhone: z.string().trim().optional(),
  })
  .superRefine(refinePicFields);

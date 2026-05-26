import { z } from "zod";

export const tenantSchema = z.object({
  name: z.string().trim().min(2, "Nama tenant minimal 2 karakter."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug tenant minimal 2 karakter.")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya huruf kecil, angka, dan tanda hubung.",
    ),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateTenantSchema = tenantSchema.extend({
  id: z.string().uuid(),
});

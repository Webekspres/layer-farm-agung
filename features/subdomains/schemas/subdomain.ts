import { z } from "zod";

export const subdomainSchema = z.object({
  name: z.string().trim().min(2, "Nama cabang minimal 2 karakter."),
  subdomainUrl: z
    .string()
    .trim()
    .min(2, "URL subdomain minimal 2 karakter.")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "URL hanya huruf kecil, angka, dan tanda hubung.",
    ),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateSubdomainSchema = subdomainSchema.extend({
  id: z.string().uuid(),
});

import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama permission minimal 3 karakter.")
    .max(64, "Nama permission maksimal 64 karakter.")
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Gunakan snake_case (huruf kecil, angka, underscore). Contoh: manage_feed.",
    ),
});

export const deletePermissionSchema = z.object({
  permissionId: z.coerce.number().int().positive(),
});

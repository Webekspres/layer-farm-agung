import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter."),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(30, "Username maksimal 30 karakter.")
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, _ dan ."),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password minimal 8 karakter."),
  roleId: z.coerce.number().int().positive("Role wajib dipilih."),
  subdomainId: z.string().uuid().optional().or(z.literal("")).or(z.literal("global")),
  isActive: z.coerce.boolean().optional().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

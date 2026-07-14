import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().trim().min(2, "Nama lokasi minimal 2 karakter."),
});

export const updateLocationSchema = locationSchema.extend({
  id: z.string().uuid(),
});

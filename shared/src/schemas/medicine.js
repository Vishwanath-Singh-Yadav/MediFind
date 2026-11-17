import { z } from "zod";

export const medicineSchema = z.object({
  brandName: z.string().min(2),
  genericName: z.string().min(2),
  manufacturer: z.string().min(2),
  category: z.string().min(2),
  dosageForm: z.string().min(2),
  strength: z.string().optional(),
  requiresPrescription: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().optional()
});

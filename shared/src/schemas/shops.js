import { z } from "zod";

export const shopSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional()
});

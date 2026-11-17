import { z } from "zod";

export const orderSchema = z.object({
  customerId: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.coerce.number().int().positive()
    })
  ).min(1)
});

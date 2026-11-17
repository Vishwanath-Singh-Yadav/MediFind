import { z } from "zod";

export const inventoryTransactionSchema = z.object({
  productId: z.string(),
  changeType: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().min(2)
});

export const inventorySchema = z.object({
  medicineId: z.string().min(1),
  batchNumber: z.string().min(1),
  expiryDate: z.coerce.date().refine((value) => value > new Date(), "Expiry date must be in the future"),
  price: z.coerce.number().positive(),
  mrp: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0),
  discountPct: z.coerce.number().min(0).max(100).optional()
});

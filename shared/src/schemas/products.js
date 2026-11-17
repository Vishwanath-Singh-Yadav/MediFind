import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().optional().nullable(),
  sku: z.string().min(1),
  barcode: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional().nullable()
});

export const categorySchema = z.object({
  name: z.string().min(2)
});

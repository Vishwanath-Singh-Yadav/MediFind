import { z } from "zod";

export const addToCartSchema = z.object({
  inventoryId: z.string(),
  quantity: z.number().int().min(1).max(20)
});

export const prescriptionSchema = z.object({
  fileUrl: z.string().url(),
  note: z.string().max(500).optional()
});

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10),
  paymentMethod: z.enum(["RAZORPAY", "STRIPE", "COD"]),
  prescriptionId: z.string().optional(),
  couponCode: z.string().max(32).optional()
});

export const orderStatusSchema = z.object({
  status: z.enum(["PLACED", "PRESCRIPTION_REVIEW", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"])
});

export const reviewSchema = z.object({
  storeId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

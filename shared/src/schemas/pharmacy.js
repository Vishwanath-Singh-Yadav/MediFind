import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(4),
  gstNumber: z.string().min(6).optional(),
  addressLine1: z.string().min(4),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  deliveryRadiusKm: z.coerce.number().positive().max(100),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  imageUrl: z.string().optional(),
}).passthrough();

export const storeVerificationSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "SUSPENDED"])
});

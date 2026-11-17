import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().min(7).optional(),
  accountType: z.enum(["CUSTOMER", "PHARMACY_OWNER"]).default("CUSTOMER")
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

export const otpRequestSchema = z.object({
  target: z.string().min(5),
  purpose: z.string().optional()
});

export const otpVerifySchema = z.object({
  target: z.string(),
  purpose: z.string().optional(),
  code: z.string().length(6)
});

export const googleAuthSchema = z.object({
  googleId: z.string().min(3),
  email: z.string().email().toLowerCase(),
  name: z.string().min(2)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

export const logoutSchema = z.object({
  sessionId: z.string()
});

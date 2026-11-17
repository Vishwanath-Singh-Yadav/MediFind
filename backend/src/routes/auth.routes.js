import { Router } from "express";
import { registerSchema, loginSchema, otpRequestSchema, otpVerifySchema, googleAuthSchema, refreshTokenSchema, logoutSchema } from "shared";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../utils/errors.js";
import { comparePassword, createToken, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, emailVerified: user.emailVerified, isActive: user.isActive });
async function ensureOwnerStore(user) {
  if (user.role !== "PHARMACY_OWNER") return null;

  const existingStore = await prisma.medicalStore.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" }
  });
  if (existingStore) return existingStore;

  return prisma.medicalStore.create({
    data: {
      ownerId: user.id,
      name: `${user.name}'s Pharmacy`,
      licenseNumber: `PENDING-${user.id}`,
      addressLine1: "Address to be updated",
      city: "Not set",
      state: "Not set",
      postalCode: "000000",
      latitude: 0,
      longitude: 0,
      deliveryRadiusKm: 5,
      openingTime: "09:00",
      closingTime: "21:00"
    }
  });
}
async function issueSession(user, req) {
  const session = await prisma.session.create({ data: { userId: user.id, refreshTokenHash: "pending", expiresAt: new Date(Date.now() + 30 * 864e5), userAgent: req.get("user-agent"), ipAddress: req.ip } });
  const refreshToken = signRefreshToken(user, session.id);
  await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: await hashPassword(refreshToken) } });
  return { accessToken: signAccessToken(user), refreshToken, sessionId: session.id, shop: await ensureOwnerStore(user) };
}

router.post("/register", asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const { password, accountType, ...identity } = data;
  const user = await prisma.user.create({ data: { ...identity, role: accountType, passwordHash: await hashPassword(password), emailVerified: false } });
  const tokens = await issueSession(user, req);
  res.status(201).json({ user: publicUser(user), ...tokens });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await comparePassword(password, user.passwordHash))) throw new HttpError(401, "Invalid email or password.");
  if (!user.isActive) throw new HttpError(403, "This account has been disabled. Please contact support.");
  res.json({ user: publicUser(user), ...(await issueSession(user, req)) });
}));

router.post("/otp/request", asyncHandler(async (req, res) => {
  const { target, purpose = "LOGIN" } = otpRequestSchema.parse(req.body);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.otpCode.create({ data: { target, purpose, codeHash: await hashPassword(code), expiresAt: new Date(Date.now() + 10 * 60e3) } });
  res.status(202).json({ message: "OTP generated. Connect your SMS/email provider to deliver it.", ...(process.env.NODE_ENV !== "production" ? { developmentOtp: code } : {}) });
}));

router.post("/otp/verify", asyncHandler(async (req, res) => {
  const { target, purpose = "LOGIN", code } = otpVerifySchema.parse(req.body);
  const otp = await prisma.otpCode.findFirst({ where: { target, purpose, usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { expiresAt: "desc" } });
  if (!otp || !(await comparePassword(code, otp.codeHash))) throw new HttpError(400, "Invalid or expired OTP.");
  const user = await prisma.user.findFirst({ where: { OR: [{ email: target }, { phone: target }] } });
  if (!user) throw new HttpError(404, "No account matches this OTP target.");
  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date(), userId: user.id } });
  res.json({ user: publicUser(user), ...(await issueSession(user, req)) });
}));

router.post("/google", asyncHandler(async (req, res) => {
  const data = googleAuthSchema.parse(req.body);
  const user = await prisma.user.upsert({ where: { email: data.email }, update: { googleId: data.googleId, emailVerified: true }, create: { ...data, emailVerified: true } });
  res.json({ user: publicUser(user), ...(await issueSession(user, req)) });
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body); const payload = verifyRefreshToken(refreshToken);
  const session = await prisma.session.findUnique({ where: { id: payload.sid }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt < new Date() || !(await comparePassword(refreshToken, session.refreshTokenHash))) throw new HttpError(401, "Invalid refresh token.");
  res.json({ accessToken: signAccessToken(session.user) });
}));
router.post("/logout", requireAuth, asyncHandler(async (req, res) => { const { sessionId } = logoutSchema.parse(req.body); await prisma.session.updateMany({ where: { id: sessionId, userId: req.user.id }, data: { revokedAt: new Date() } }); res.status(204).end(); }));
router.get("/sessions", requireAuth, asyncHandler(async (req, res) => res.json(await prisma.session.findMany({ where: { userId: req.user.id }, select: { id: true, createdAt: true, expiresAt: true, userAgent: true, ipAddress: true, revokedAt: true }, orderBy: { createdAt: "desc" } }))));

export default router;

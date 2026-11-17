import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
if (!accessSecret || !refreshSecret) console.warn("JWT secrets are not configured. Set them before production.");

export const hashPassword = (value) => bcrypt.hash(value, 12);
export const comparePassword = (value, hash) => bcrypt.compare(value, hash);
export const createToken = () => nanoid(48);
export const signAccessToken = (user) => jwt.sign({ sub: user.id, role: user.role, email: user.email }, accessSecret || "development-access-secret", { expiresIn: "15m" });
export const signRefreshToken = (user, sessionId) => jwt.sign({ sub: user.id, sid: sessionId }, refreshSecret || "development-refresh-secret", { expiresIn: "30d" });
export const verifyAccessToken = (token) => jwt.verify(token, accessSecret || "development-access-secret");
export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret || "development-refresh-secret");

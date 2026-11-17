import { prisma } from "../db.js";
import { HttpError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/auth.js";

export async function requireAuth(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Authentication is required.");
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new HttpError(401, "This account is no longer active.");
    req.user = user;
    next();
  } catch (error) { next(error.status ? error : new HttpError(401, "Invalid or expired access token.")); }
}

export const allowRoles = (...roles) => (req, _res, next) => roles.includes(req.user?.role)
  ? next() : next(new HttpError(403, "You do not have permission for this action."));

export async function requireStoreAccess(req, _res, next) {
  try {
    const storeId = req.params.storeId || req.body.storeId || req.headers["x-store-id"];
    if (!storeId) throw new HttpError(400, "A store id is required.");
    const store = await prisma.medicalStore.findUnique({ where: { id: String(storeId) } });
    if (!store) throw new HttpError(404, "Store not found.");
    const elevated = ["ADMIN", "PHARMACIST"].includes(req.user.role);
    if (!elevated && store.ownerId !== req.user.id) throw new HttpError(403, "You do not have access to this store.");
    req.store = store;
    next();
  } catch (error) { next(error); }
}

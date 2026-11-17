import { Router } from "express";
import { inventorySchema } from "shared";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../utils/errors.js";
import { allowRoles, requireAuth, requireStoreAccess } from "../middleware/auth.js";
import multer from "multer";
import { uploadImage } from "../utils/upload.js";

const router = Router();
const calculatedDiscount = (mrp, price) => {
  const maximumRetailPrice = Number(mrp || 0);
  const sellingPrice = Number(price || 0);
  if (!maximumRetailPrice) return 0;
  return Math.min(100, Math.max(0, ((maximumRetailPrice - sellingPrice) / maximumRetailPrice) * 100));
};
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype))
});
// Schema imported from shared package
router.get("/store/:storeId", asyncHandler(async (req, res) => res.json(await prisma.inventory.findMany({ where: { storeId: req.params.storeId }, include: { medicine: true, images: { orderBy: { sortOrder: "asc" } } }, orderBy: { updatedAt: "desc" } }))));
router.post("/store/:storeId", requireAuth, allowRoles("PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACIST", "ADMIN"), requireStoreAccess, asyncHandler(async (req, res) => {
  const data = inventorySchema.parse(req.body);
  res.status(201).json(await prisma.inventory.create({ data: { ...data, discountPct: calculatedDiscount(data.mrp, data.price), storeId: req.store.id }, include: { medicine: true, images: true } }));
}));
router.patch("/:id", requireAuth, allowRoles("PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACIST", "ADMIN"), asyncHandler(async (req, res) => {
  const row = await prisma.inventory.findUnique({ where: { id: req.params.id } });
  if (!row) throw new HttpError(404, "Inventory item not found.");
  req.params.storeId = row.storeId;
  req.body.storeId = row.storeId;
  const store = await prisma.medicalStore.findUnique({ where: { id: row.storeId } });
  if (req.user.role !== "ADMIN" && store.ownerId !== req.user.id) throw new HttpError(403, "You do not have access to this inventory.");
  const data = inventorySchema.partial().parse(req.body);
  const mrp = data.mrp ?? row.mrp;
  const price = data.price ?? row.price;
  res.json(await prisma.inventory.update({ where: { id: row.id }, data: { ...data, discountPct: calculatedDiscount(mrp, price) } }));
}));
router.post("/:id/images", requireAuth, allowRoles("PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACIST", "ADMIN"), imageUpload.array("images", 10), asyncHandler(async (req, res) => {
  const row = await prisma.inventory.findUnique({ where: { id: req.params.id }, include: { store: true } });
  if (!row) throw new HttpError(404, "Inventory item not found.");
  if (req.user.role !== "ADMIN" && row.store.ownerId !== req.user.id) throw new HttpError(403, "You do not have access to this inventory.");
  if (!req.files?.length) throw new HttpError(400, "Select at least one image.");
  const startOrder = await prisma.inventoryImage.count({ where: { inventoryId: row.id } });
  const images = await Promise.all(req.files.map((file, index) => uploadImage(file).then((imageUrl) => ({ inventoryId: row.id, imageUrl, sortOrder: startOrder + index }))));
  await prisma.inventoryImage.createMany({ data: images });
  res.status(201).json(await prisma.inventoryImage.findMany({ where: { inventoryId: row.id }, orderBy: { sortOrder: "asc" } }));
}));
router.delete("/:id/images/:imageId", requireAuth, allowRoles("PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACIST", "ADMIN"), asyncHandler(async (req, res) => {
  const image = await prisma.inventoryImage.findUnique({ where: { id: req.params.imageId }, include: { inventory: { include: { store: true } } } });
  if (!image || image.inventoryId !== req.params.id) throw new HttpError(404, "Image not found.");
  if (req.user.role !== "ADMIN" && image.inventory.store.ownerId !== req.user.id) throw new HttpError(403, "You do not have access to this inventory.");
  await prisma.inventoryImage.delete({ where: { id: image.id } });
  res.status(204).end();
}));
router.delete("/:id", requireAuth, allowRoles("PHARMACY_OWNER", "PHARMACY_MANAGER", "PHARMACIST", "ADMIN"), asyncHandler(async (req, res) => { const row = await prisma.inventory.findUnique({ where: { id: req.params.id }, include: { store: true } }); if (!row) throw new HttpError(404, "Inventory item not found."); if (req.user.role !== "ADMIN" && row.store.ownerId !== req.user.id) throw new HttpError(403, "You do not have access to this inventory."); await prisma.inventory.delete({ where: { id: row.id } }); res.status(204).end(); }));
export default router;

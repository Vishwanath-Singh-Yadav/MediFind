import { Router } from "express";
import { medicineSchema } from "shared";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../utils/errors.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();
// Schema imported from shared package
router.get("/", asyncHandler(async (req, res) => { const q = String(req.query.q || "").trim(); const category = req.query.category ? String(req.query.category) : undefined; const medicines = await prisma.medicine.findMany({ where: { isActive: true, ...(category ? { category } : {}), ...(q ? { OR: ["brandName", "genericName", "manufacturer"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}) }, orderBy: { brandName: "asc" }, take: Math.min(Number(req.query.limit) || 30, 100) }); res.json(medicines); }));
router.get("/:id", asyncHandler(async (req, res) => { const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } }); if (!medicine) throw new HttpError(404, "Medicine not found."); res.json(medicine); }));
router.post("/", requireAuth, allowRoles("ADMIN", "PHARMACY_OWNER", "PHARMACIST"), asyncHandler(async (req, res) => res.status(201).json(await prisma.medicine.create({ data: medicineSchema.parse(req.body) }))));
router.patch("/:id", requireAuth, allowRoles("ADMIN", "PHARMACY_OWNER", "PHARMACIST"), asyncHandler(async (req, res) => res.json(await prisma.medicine.update({ where: { id: req.params.id }, data: medicineSchema.partial().parse(req.body) }))));
router.delete("/:id", requireAuth, allowRoles("ADMIN"), asyncHandler(async (req, res) => { await prisma.medicine.update({ where: { id: req.params.id }, data: { isActive: false } }); res.status(204).end(); }));
export default router;

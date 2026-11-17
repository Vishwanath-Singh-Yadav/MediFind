import { Router } from "express";
import { storeSchema, storeVerificationSchema } from "shared";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../utils/errors.js";
import { allowRoles, requireAuth, requireStoreAccess } from "../middleware/auth.js";

const router = Router();
// Schema imported from shared package
router.post("/", requireAuth, allowRoles("PHARMACY_OWNER", "ADMIN"), asyncHandler(async (req, res) => {
  const { ownerName, ownerPhone, imageUrl, ...restData } = req.body;
  const parsedData = storeSchema.parse(restData);
  const allowedColumns = [
    "name", "licenseNumber", "gstNumber", "addressLine1", "addressLine2",
    "city", "state", "postalCode", "latitude", "longitude",
    "deliveryRadiusKm", "openingTime", "closingTime"
  ];
  const dbData = { ownerId: req.user.id };
  for (const col of allowedColumns) {
    if (parsedData[col] !== undefined) {
      dbData[col] = parsedData[col];
    }
  }
  res.status(201).json(await prisma.medicalStore.create({ data: dbData }));
}));
router.get("/mine", requireAuth, asyncHandler(async (req, res) => {
  let stores = await prisma.medicalStore.findMany({ where: { ownerId: req.user.id }, include: { owner: { select: { name: true, phone: true } } }, orderBy: { createdAt: "desc" } });
  if (req.user.role === "PHARMACY_OWNER" && stores.length === 0) {
    stores = [await prisma.medicalStore.create({
      data: {
        ownerId: req.user.id,
        name: `${req.user.name}'s Pharmacy`,
        licenseNumber: `PENDING-${req.user.id}`,
        addressLine1: "Address to be updated",
        city: "Not set",
        state: "Not set",
        postalCode: "000000",
        latitude: 0,
        longitude: 0,
        deliveryRadiusKm: 5,
        openingTime: "09:00",
        closingTime: "21:00"
      },
      include: { owner: { select: { name: true, phone: true } } }
    })];
  }
  res.json(stores);
}));
router.get("/admin/pending", requireAuth, allowRoles("ADMIN"), asyncHandler(async (_req, res) => res.json(await prisma.medicalStore.findMany({ where: { verificationStatus: "PENDING" }, include: { owner: { select: { name: true, phone: true } } }, orderBy: { createdAt: "asc" } }))));
router.get("/:storeId", asyncHandler(async (req, res) => { const store = await prisma.medicalStore.findUnique({ where: { id: req.params.storeId }, include: { owner: { select: { name: true, phone: true } } } }); if (!store) throw new HttpError(404, "Store not found."); res.json(store); }));
router.patch("/:storeId", requireAuth, requireStoreAccess, asyncHandler(async (req, res) => {
  const { ownerName, ownerPhone, imageUrl, ...restData } = req.body;
  const parsedData = storeSchema.partial().parse(restData);

  // Whitelist only columns that exist on the MedicalStore database table
  const allowedColumns = [
    "name", "licenseNumber", "gstNumber", "addressLine1", "addressLine2",
    "city", "state", "postalCode", "latitude", "longitude",
    "deliveryRadiusKm", "openingTime", "closingTime"
  ];
  const dbData = {};
  for (const col of allowedColumns) {
    if (parsedData[col] !== undefined) {
      dbData[col] = parsedData[col];
    }
  }

  const updatedStore = await prisma.medicalStore.update({
    where: { id: req.store.id },
    data: dbData,
    include: { owner: { select: { name: true, phone: true } } }
  });

  if (ownerName || ownerPhone) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(ownerName ? { name: String(ownerName).trim() } : {}),
        ...(ownerPhone ? { phone: String(ownerPhone).trim() } : {})
      }
    }).catch((err) => console.warn("Could not update user owner profile:", err.message));
  }

  res.json({
    ...updatedStore,
    imageUrl: imageUrl || undefined,
    owner: {
      name: ownerName || updatedStore.owner?.name,
      phone: ownerPhone || updatedStore.owner?.phone
    }
  });
}));
router.patch("/:storeId/verification", requireAuth, allowRoles("ADMIN"), asyncHandler(async (req, res) => { const { status } = storeVerificationSchema.parse(req.body); res.json(await prisma.medicalStore.update({ where: { id: req.params.storeId }, data: { verificationStatus: status, verifiedAt: status === "VERIFIED" ? new Date() : null, verifiedById: req.user.id } })); }));
export default router;

import { Router } from "express";
import { addToCartSchema, prescriptionSchema, checkoutSchema, orderStatusSchema, reviewSchema } from "shared";
import { nanoid } from "nanoid";
import { prisma } from "../db.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/errors.js";

const router = Router();
const number = (value) => Number(value || 0);
const includedCart = { items: { include: { inventory: { include: { medicine: true, store: true } } } } };
const distanceInKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(lat2 - lat1);
  const longitudeDelta = toRadians(lng2 - lng1);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Search is intentionally provider-neutral: use PostgreSQL now; point a Meilisearch/Elasticsearch indexer at this endpoint's data later.
router.get("/search", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const prescription = req.query.prescription === "true" ? true : req.query.prescription === "false" ? false : undefined;
  const customerLatitude = Number(req.query.lat);
  const customerLongitude = Number(req.query.lng);
  const hasCustomerLocation = Number.isFinite(customerLatitude) && Number.isFinite(customerLongitude);
  const rows = await prisma.inventory.findMany({
    where: { stock: { gt: 0 }, ...(maxPrice ? { price: { lte: maxPrice } } : {}), medicine: { isActive: true, ...(prescription === undefined ? {} : { requiresPrescription: prescription }), ...(q ? { OR: ["brandName", "genericName", "description", "category"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}) }, store: { verificationStatus: { not: "SUSPENDED" } } },
    include: {
      medicine: true,
      images: { orderBy: { sortOrder: "asc" } },
      store: {
        include: {
          reviews: { select: { rating: true } },
          owner: { select: { name: true, phone: true } }
        }
      }
    },
    take: 200
  });
  const results = rows.map((row) => {
    const distanceKm = hasCustomerLocation
      ? distanceInKm(customerLatitude, customerLongitude, number(row.store.latitude), number(row.store.longitude))
      : null;
    return {
      ...row,
      price: number(row.price),
      mrp: number(row.mrp),
      discountPct: number(row.discountPct),
      distanceKm,
      rating: row.store.reviews.length ? row.store.reviews.reduce((sum, review) => sum + review.rating, 0) / row.store.reviews.length : null,
      store: {
        ...row.store,
        ownerName: row.store.owner?.name,
        ownerPhone: row.store.owner?.phone,
      }
    };
  }).sort((a, b) => {
    if (a.distanceKm == null || b.distanceKm == null) return 0;
    return a.distanceKm - b.distanceKm;
  });
  res.json({ correctedQuery: q, results });
}));

router.use(requireAuth, allowRoles("CUSTOMER", "ADMIN"));
router.get("/cart", asyncHandler(async (req, res) => res.json(await prisma.cart.upsert({ where: { userId: req.user.id }, create: { userId: req.user.id }, update: {}, include: includedCart }))));
router.post("/cart/items", asyncHandler(async (req, res) => {
  const data = addToCartSchema.parse(req.body);
  const inventory = await prisma.inventory.findFirst({ where: { id: data.inventoryId, stock: { gte: data.quantity } } });
  if (!inventory) throw new HttpError(400, "This medicine is no longer available in the requested quantity.");
  const cart = await prisma.cart.upsert({ where: { userId: req.user.id }, create: { userId: req.user.id }, update: {} });
  await prisma.cartItem.upsert({ where: { cartId_inventoryId: { cartId: cart.id, inventoryId: data.inventoryId } }, create: { cartId: cart.id, inventoryId: data.inventoryId, quantity: data.quantity }, update: { quantity: data.quantity } });
  res.json(await prisma.cart.findUnique({ where: { id: cart.id }, include: includedCart }));
}));
router.delete("/cart/items/:inventoryId", asyncHandler(async (req, res) => { const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } }); if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, inventoryId: req.params.inventoryId } }); res.status(204).end(); }));

router.post("/prescriptions", asyncHandler(async (req, res) => { const body = prescriptionSchema.parse(req.body); res.status(201).json(await prisma.prescription.create({ data: { ...body, userId: req.user.id } })); }));
router.post("/checkout", asyncHandler(async (req, res) => {
  const data = checkoutSchema.parse(req.body);
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: includedCart });
  if (!cart?.items.length) throw new HttpError(400, "Your cart is empty.");
  const storeId = cart.items[0].inventory.storeId;
  if (cart.items.some((item) => item.inventory.storeId !== storeId)) throw new HttpError(400, "Please checkout one pharmacy at a time.");
  const requiresPrescription = cart.items.some((item) => item.inventory.medicine.requiresPrescription);
  if (requiresPrescription && !data.prescriptionId) throw new HttpError(400, "A prescription is required for this order.");
  const subtotal = cart.items.reduce((sum, item) => sum + number(item.inventory.price) * item.quantity, 0);
  const discount = data.couponCode === "HEALTH10" ? Math.min(subtotal * .1, 150) : 0;
  const deliveryFee = subtotal - discount >= 500 ? 0 : 39;
  const status = requiresPrescription ? "PRESCRIPTION_REVIEW" : "PLACED";
  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) { if (item.inventory.stock < item.quantity) throw new HttpError(400, `${item.inventory.medicine.brandName} is out of stock.`); await tx.inventory.update({ where: { id: item.inventoryId }, data: { stock: { decrement: item.quantity } } }); }
    const created = await tx.commerceOrder.create({ data: { orderNumber: `MED-${nanoid(7).toUpperCase()}`, userId: req.user.id, storeId, prescriptionId: data.prescriptionId, status, subtotal, discountAmount: discount, deliveryFee, totalAmount: subtotal - discount + deliveryFee, deliveryAddress: data.deliveryAddress, etaMinutes: 35, items: { create: cart.items.map((item) => ({ medicineId: item.inventory.medicineId, medicineName: item.inventory.medicine.brandName, quantity: item.quantity, unitPrice: item.inventory.price })) }, payment: { create: { provider: data.paymentMethod, status: "PENDING", amount: subtotal - discount + deliveryFee } } }, include: { items: true, payment: true, store: true } });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } }); return created;
  });
  res.status(201).json({ order, payment: { provider: data.paymentMethod, checkoutRequired: data.paymentMethod !== "COD" } });
}));
router.get("/orders", asyncHandler(async (req, res) => res.json(await prisma.commerceOrder.findMany({ where: { userId: req.user.id }, include: { items: true, store: true, payment: true, prescription: true }, orderBy: { createdAt: "desc" } }))));
router.patch("/orders/:id/status", allowRoles("ADMIN"), asyncHandler(async (req, res) => { const { status } = orderStatusSchema.parse(req.body); res.json(await prisma.commerceOrder.update({ where: { id: req.params.id }, data: { status } })); }));
router.post("/reviews", asyncHandler(async (req, res) => { const data = reviewSchema.parse(req.body); res.json(await prisma.storeReview.upsert({ where: { storeId_userId: { storeId: data.storeId, userId: req.user.id } }, create: { ...data, userId: req.user.id }, update: { rating: data.rating, comment: data.comment } })); }));
export default router;

import { Router } from "express";
import { aiSymptomSearchSchema } from "shared";
import { prisma } from "../db.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/errors.js";

const router = Router(); const num = (v) => Number(v || 0);
router.use(requireAuth);
router.get("/admin/overview", allowRoles("ADMIN"), asyncHandler(async (_req,res) => {
  const [users, stores, orders, revenue, pending, recent] = await Promise.all([prisma.user.count(),prisma.medicalStore.count(),prisma.commerceOrder.count(),prisma.commerceOrder.aggregate({ _sum:{totalAmount:true}, where:{status:{not:"CANCELLED"}}}),prisma.medicalStore.count({where:{verificationStatus:"PENDING"}}),prisma.auditLog.findMany({take:15,orderBy:{createdAt:"desc"},include:{user:{select:{name:true,email:true}}}})]);
  res.json({ metrics:{users,stores,orders,revenue:num(revenue._sum.totalAmount),pendingVerifications:pending}, recentAudit:recent });
}));
router.get("/admin/users", allowRoles("ADMIN"), asyncHandler(async (req,res) => res.json(await prisma.user.findMany({ take:Math.min(+req.query.limit||100,100), orderBy:{createdAt:"desc"}, select:{id:true,name:true,email:true,phone:true,role:true,createdAt:true,emailVerified:true,isActive:true,stores:{select:{id:true,name:true,verificationStatus:true},take:1}} }))));
router.get("/admin/pharmacies", allowRoles("ADMIN"), asyncHandler(async (_req,res) => res.json(await prisma.medicalStore.findMany({ orderBy:{createdAt:"desc"}, include:{ owner:{select:{id:true,name:true,email:true,phone:true,isActive:true}}, _count:{select:{inventory:true,orders:true,reviews:true}} } }))));
router.patch("/admin/pharmacies/:id/status", allowRoles("ADMIN"), asyncHandler(async (req,res) => {
  const { status } = req.body;
  if (!["PENDING","VERIFIED","REJECTED","SUSPENDED"].includes(status)) throw new HttpError(400, "Invalid pharmacy status.");
  const store = await prisma.medicalStore.update({ where:{id:req.params.id}, data:{ verificationStatus:status, verifiedAt:status === "VERIFIED" ? new Date() : null, verifiedById:status === "VERIFIED" ? req.user.id : null }, include:{ owner:{select:{id:true,name:true,email:true,phone:true,isActive:true}}, _count:{select:{inventory:true,orders:true,reviews:true}} } });
  res.json(store);
}));
router.patch("/admin/users/:id/status", allowRoles("ADMIN"), asyncHandler(async (req,res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new HttpError(404, "User not found.");
  if (user.id === req.user.id) throw new HttpError(400, "You cannot disable your own account.");
  const isActive = typeof req.body.isActive === "boolean" ? req.body.isActive : !user.isActive;
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { isActive } }),
    ...(isActive ? [] : [prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]),
    prisma.auditLog.create({ data: { userId: req.user.id, action: isActive ? "ENABLE_USER" : "DISABLE_USER", entity: "USER", entityId: user.id, ipAddress: req.ip } })
  ]);
  res.json({ ...user, isActive });
}));
router.patch("/admin/users/:id/disable", allowRoles("ADMIN"), asyncHandler(async (req,res) => {
  req.body = { isActive: false };
  const user = await prisma.user.findUnique({ where:{id:req.params.id} });
  if (!user) throw new HttpError(404,"User not found.");
  if (user.id === req.user.id) throw new HttpError(400,"You cannot disable your own account.");
  await prisma.$transaction([prisma.user.update({where:{id:user.id},data:{isActive:false}}), prisma.session.updateMany({where:{userId:user.id,revokedAt:null},data:{revokedAt:new Date()}})]);
  res.status(204).end();
}));
router.get("/admin/transactions", allowRoles("ADMIN"), asyncHandler(async (_req,res) => res.json(await prisma.commerceOrder.findMany({take:100,orderBy:{createdAt:"desc"},include:{user:{select:{name:true,email:true}},store:{select:{name:true}},payment:true}}))));
router.get("/pharmacy/overview/:storeId", allowRoles("PHARMACY_OWNER","PHARMACY_MANAGER","PHARMACIST","ADMIN"), asyncHandler(async (req,res) => {
  const store=await prisma.medicalStore.findUnique({where:{id:req.params.storeId}}); if(!store) throw new HttpError(404,"Store not found."); if(req.user.role!=="ADMIN"&&store.ownerId!==req.user.id) throw new HttpError(403,"You do not have access to this pharmacy.");
  const [sales, orders, lowStock, inventory]=await Promise.all([prisma.commerceOrder.aggregate({_sum:{totalAmount:true},where:{storeId:store.id,status:{not:"CANCELLED"}}}),prisma.commerceOrder.count({where:{storeId:store.id}}),prisma.inventory.count({where:{storeId:store.id,stock:{lte:10}}}),prisma.inventory.findMany({where:{storeId:store.id},include:{medicine:true},orderBy:{stock:"asc"},take:10})]);
  res.json({sales:num(sales._sum.totalAmount),orders,lowStock,inventory});
}));
router.get("/customer", allowRoles("CUSTOMER","ADMIN"), asyncHandler(async (req,res) => { const [orders,wishlist,savedStores,prescriptions,notifications]=await Promise.all([prisma.commerceOrder.findMany({where:{userId:req.user.id},include:{store:true,payment:true},take:20,orderBy:{createdAt:"desc"}}),prisma.wishlistItem.findMany({where:{userId:req.user.id},include:{medicine:true}}),prisma.savedStore.findMany({where:{userId:req.user.id},include:{store:true}}),prisma.prescription.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"}}),prisma.notification.findMany({where:{userId:req.user.id},take:50,orderBy:{createdAt:"desc"}})]);res.json({orders,wishlist,savedStores,prescriptions,notifications}); }));
router.post("/wishlist/:medicineId", allowRoles("CUSTOMER","ADMIN"), asyncHandler(async(req,res)=>res.json(await prisma.wishlistItem.upsert({where:{userId_medicineId:{userId:req.user.id,medicineId:req.params.medicineId}},create:{userId:req.user.id,medicineId:req.params.medicineId},update:{}}))));
router.post("/saved-stores/:storeId", allowRoles("CUSTOMER","ADMIN"), asyncHandler(async(req,res)=>res.json(await prisma.savedStore.upsert({where:{userId_storeId:{userId:req.user.id,storeId:req.params.storeId}},create:{userId:req.user.id,storeId:req.params.storeId},update:{}}))));
router.patch("/notifications/:id/read", asyncHandler(async(req,res)=>res.json(await prisma.notification.updateMany({where:{id:req.params.id,userId:req.user.id},data:{readAt:new Date()}}))));
router.post("/ai/symptom-search", allowRoles("CUSTOMER","ADMIN"), asyncHandler(async(req,res)=>{const {query}=aiSymptomSearchSchema.parse(req.body); const medicines=await prisma.medicine.findMany({where:{isActive:true,OR:[{description:{contains:query,mode:"insensitive"}},{category:{contains:query,mode:"insensitive"}},{genericName:{contains:query,mode:"insensitive"}}]},take:8});res.json({disclaimer:"This tool is not medical advice and does not diagnose conditions. Consult a licensed clinician or pharmacist, especially for severe or persistent symptoms.",medicines});}));
export default router;

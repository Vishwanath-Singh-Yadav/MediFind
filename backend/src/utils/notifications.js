import { prisma } from "../db.js";

export async function logNotification(shopId, type, message, status = "PENDING") {
  return prisma.notification.create({ data: { shopId, type, message, status, sentAt: status === "SENT" ? new Date() : null } });
}

export async function checkLowStock(product, shop) {
  const threshold = product.lowStockThreshold ?? shop.lowStockThreshold;
  if (product.stockQuantity > threshold) return null;

  const message = `${product.name} is low on stock. Current stock: ${product.stockQuantity}. Threshold: ${threshold}.`;
  return logNotification(shop.id, "LOW_STOCK", message);
}

CREATE TABLE "inventory_images" (
    "id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inventory_images_inventory_id_sort_order_idx" ON "inventory_images"("inventory_id", "sort_order");

ALTER TABLE "inventory_images" ADD CONSTRAINT "inventory_images_inventory_id_fkey"
  FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

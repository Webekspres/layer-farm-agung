-- AlterTable: link a treatment to an inventory item (nullable, free-text fallback kept)
ALTER TABLE "MedicalRecord" ADD COLUMN     "item_id" UUID,
ADD COLUMN     "quantity_used" DOUBLE PRECISION;

-- CreateIndex: one stock row per (item, location)
CREATE UNIQUE INDEX "InventoryStock_item_id_location_id_key" ON "InventoryStock"("item_id", "location_id");

-- AddForeignKey: keep treatment history when an item is deleted
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

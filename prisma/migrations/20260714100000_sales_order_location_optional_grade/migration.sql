-- Sales: bind to warehouse location; egg grade + weight become optional (label only).
ALTER TABLE "SalesOrder" ADD COLUMN "location_id" UUID;

ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SalesOrderItem" ALTER COLUMN "egg_grade_id" DROP NOT NULL;

ALTER TABLE "SalesOrderItem" ALTER COLUMN "weight" DROP NOT NULL;

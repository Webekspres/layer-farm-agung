/*
  Warnings:

  - A unique constraint covering the columns `[location_id,name]` on the table `Cage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cage_location_id_name_key" ON "Cage"("location_id", "name");

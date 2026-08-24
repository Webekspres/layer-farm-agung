-- CreateTable
CREATE TABLE "EggStock" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "egg_grade_id" INTEGER NOT NULL,
    "location_id" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EggStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggMovement" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "egg_grade_id" INTEGER NOT NULL,
    "location_id" UUID NOT NULL,
    "mutation_type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reference_id" UUID,
    "mutation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EggMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EggStock_tenant_id_idx" ON "EggStock"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "EggStock_egg_grade_id_location_id_key" ON "EggStock"("egg_grade_id", "location_id");

-- CreateIndex
CREATE INDEX "EggMovement_tenant_id_egg_grade_id_location_id_mutation_dat_idx" ON "EggMovement"("tenant_id", "egg_grade_id", "location_id", "mutation_date");

-- AddForeignKey
ALTER TABLE "EggStock" ADD CONSTRAINT "EggStock_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggStock" ADD CONSTRAINT "EggStock_egg_grade_id_fkey" FOREIGN KEY ("egg_grade_id") REFERENCES "EggGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggStock" ADD CONSTRAINT "EggStock_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggMovement" ADD CONSTRAINT "EggMovement_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggMovement" ADD CONSTRAINT "EggMovement_egg_grade_id_fkey" FOREIGN KEY ("egg_grade_id") REFERENCES "EggGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggMovement" ADD CONSTRAINT "EggMovement_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

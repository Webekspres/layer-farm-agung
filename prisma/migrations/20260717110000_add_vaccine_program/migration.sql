-- CreateTable
CREATE TABLE "VaccineProgram" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "strain_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaccineProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccineProgramStep" (
    "id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "age_days" INTEGER NOT NULL,
    "item_id" UUID NOT NULL,
    "pathogen_label" TEXT,
    "formulation_type" TEXT,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VaccineProgramStep_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "VaccineSchedule" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'Manual';
ALTER TABLE "VaccineSchedule" ADD COLUMN "program_step_id" UUID;

-- CreateIndex
CREATE INDEX "VaccineProgram_tenant_id_is_active_idx" ON "VaccineProgram"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "VaccineProgram_tenant_id_strain_id_idx" ON "VaccineProgram"("tenant_id", "strain_id");

-- CreateIndex
CREATE INDEX "VaccineProgramStep_program_id_age_days_idx" ON "VaccineProgramStep"("program_id", "age_days");

-- CreateIndex
CREATE INDEX "VaccineSchedule_cage_id_program_step_id_status_idx" ON "VaccineSchedule"("cage_id", "program_step_id", "status");

-- AddForeignKey
ALTER TABLE "VaccineProgram" ADD CONSTRAINT "VaccineProgram_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineProgram" ADD CONSTRAINT "VaccineProgram_strain_id_fkey" FOREIGN KEY ("strain_id") REFERENCES "Strain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineProgramStep" ADD CONSTRAINT "VaccineProgramStep_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "VaccineProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineProgramStep" ADD CONSTRAINT "VaccineProgramStep_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccineSchedule" ADD CONSTRAINT "VaccineSchedule_program_step_id_fkey" FOREIGN KEY ("program_step_id") REFERENCES "VaccineProgramStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

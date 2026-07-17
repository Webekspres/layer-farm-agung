-- AlterTable
ALTER TABLE "VaccineSchedule" ADD COLUMN     "client_mutation_id" UUID,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "completed_by_user_id" UUID,
ADD COLUMN     "is_synced" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quantity_used" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "VaccineSchedule_client_mutation_id_key" ON "VaccineSchedule"("client_mutation_id");

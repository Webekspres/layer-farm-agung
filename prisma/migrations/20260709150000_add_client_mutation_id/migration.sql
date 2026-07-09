-- AlterTable
ALTER TABLE "DailyProduction" ADD COLUMN "client_mutation_id" UUID;

-- AlterTable
ALTER TABLE "FeedConsumption" ADD COLUMN "client_mutation_id" UUID;

-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN "client_mutation_id" UUID;

-- AlterTable
ALTER TABLE "PopulationMutation" ADD COLUMN "client_mutation_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "DailyProduction_client_mutation_id_key" ON "DailyProduction"("client_mutation_id");

-- CreateIndex
CREATE UNIQUE INDEX "FeedConsumption_client_mutation_id_key" ON "FeedConsumption"("client_mutation_id");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_client_mutation_id_key" ON "MedicalRecord"("client_mutation_id");

-- CreateIndex
CREATE UNIQUE INDEX "PopulationMutation_client_mutation_id_key" ON "PopulationMutation"("client_mutation_id");

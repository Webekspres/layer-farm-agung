/*
  Warnings:

  - Added the required column `tenant_id` to the `FeedConsumption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_method` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosage_and_duration` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicine_name` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `PopulationMutation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeedConsumption" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "tenant_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "application_method" TEXT NOT NULL,
ADD COLUMN     "dosage_and_duration" TEXT NOT NULL,
ADD COLUMN     "is_synced" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "medicine_name" TEXT NOT NULL,
ADD COLUMN     "mortality_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sick_population" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "PopulationMutation" ADD COLUMN     "is_synced" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "brand_name" TEXT,
ADD COLUMN     "logo_url" TEXT;

-- AddForeignKey
ALTER TABLE "FeedConsumption" ADD CONSTRAINT "FeedConsumption_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopulationMutation" ADD CONSTRAINT "PopulationMutation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

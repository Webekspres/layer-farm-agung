-- AlterTable
ALTER TABLE "PopulationMutation" ADD COLUMN     "target_cage_id" UUID;

-- AddForeignKey
ALTER TABLE "PopulationMutation" ADD CONSTRAINT "PopulationMutation_target_cage_id_fkey" FOREIGN KEY ("target_cage_id") REFERENCES "Cage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

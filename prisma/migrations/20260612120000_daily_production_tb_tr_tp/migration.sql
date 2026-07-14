-- DailyProduction: replace EggGrade rows with TB/TR/TP harvest buckets

ALTER TABLE "DailyProduction" ADD COLUMN "tb" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DailyProduction" ADD COLUMN "tr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DailyProduction" ADD COLUMN "tp" INTEGER NOT NULL DEFAULT 0;

UPDATE "DailyProduction"
SET
  "tb" = COALESCE("quantity", 0),
  "tp" = COALESCE("egg_crack", 0)
WHERE TRUE;

ALTER TABLE "DailyProduction" DROP CONSTRAINT "DailyProduction_egg_grade_id_fkey";

ALTER TABLE "DailyProduction" DROP COLUMN "egg_grade_id";
ALTER TABLE "DailyProduction" DROP COLUMN "quantity";
ALTER TABLE "DailyProduction" DROP COLUMN "egg_crack";

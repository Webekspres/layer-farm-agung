-- AlterTable
ALTER TABLE "EggGrade" ADD COLUMN     "code" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailyProductionItem" (
    "id" UUID NOT NULL,
    "production_id" UUID NOT NULL,
    "egg_grade_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyProductionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyProductionItem_production_id_idx" ON "DailyProductionItem"("production_id");

-- CreateIndex
CREATE INDEX "DailyProductionItem_egg_grade_id_idx" ON "DailyProductionItem"("egg_grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "EggGrade_code_key" ON "EggGrade"("code");

-- AddForeignKey
ALTER TABLE "DailyProductionItem" ADD CONSTRAINT "DailyProductionItem_production_id_fkey" FOREIGN KEY ("production_id") REFERENCES "DailyProduction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyProductionItem" ADD CONSTRAINT "DailyProductionItem_egg_grade_id_fkey" FOREIGN KEY ("egg_grade_id") REFERENCES "EggGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================
-- Seed grade produksi (TB/TR/TP — sesuai ERP AAPM)
-- TP = Telur Putih; Telur Pecah = rincian Telur Retak (TR)
-- =============================================
INSERT INTO "EggGrade" ("name", "code", "description", "is_active", "sort_order")
VALUES
  ('Telur Bagus', 'TB', 'Telur layak jual / konsumsi', true, 1),
  ('Telur Retak', 'TR', 'Telur retak (termasuk rincian telur pecah)', true, 2),
  ('Telur Putih', 'TP', 'Telur putih (referensi ERP AAPM)', true, 3)
ON CONFLICT ("code") DO UPDATE SET "sort_order" = EXCLUDED."sort_order";

-- =============================================
-- Backfill DailyProductionItem dari kolom legacy tb/tr/tp
-- (mapping 1:1 berdasarkan kode grade; histori tetap terbaca)
-- =============================================
INSERT INTO "DailyProductionItem" ("id", "production_id", "egg_grade_id", "quantity", "created_at")
SELECT gen_random_uuid(), dp."id", eg."id", dp."tb", now()
FROM "DailyProduction" dp
JOIN "EggGrade" eg ON eg."code" = 'TB'
WHERE dp."tb" > 0;

INSERT INTO "DailyProductionItem" ("id", "production_id", "egg_grade_id", "quantity", "created_at")
SELECT gen_random_uuid(), dp."id", eg."id", dp."tr", now()
FROM "DailyProduction" dp
JOIN "EggGrade" eg ON eg."code" = 'TR'
WHERE dp."tr" > 0;

INSERT INTO "DailyProductionItem" ("id", "production_id", "egg_grade_id", "quantity", "created_at")
SELECT gen_random_uuid(), dp."id", eg."id", dp."tp", now()
FROM "DailyProduction" dp
JOIN "EggGrade" eg ON eg."code" = 'TP'
WHERE dp."tp" > 0;

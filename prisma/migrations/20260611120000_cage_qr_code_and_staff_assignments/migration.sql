-- AlterTable: unique QR token per cage
ALTER TABLE "Cage" ADD COLUMN "qr_code" TEXT;

UPDATE "Cage"
SET "qr_code" = 'KDG' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 10))
WHERE "qr_code" IS NULL;

ALTER TABLE "Cage" ALTER COLUMN "qr_code" SET NOT NULL;

CREATE UNIQUE INDEX "Cage_qr_code_key" ON "Cage"("qr_code");

-- Staff ↔ cage assignments (field staff only see/input assigned cages)
CREATE TABLE "cage_staff_assignment" (
    "cage_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cage_staff_assignment_pkey" PRIMARY KEY ("cage_id","user_id")
);

CREATE INDEX "cage_staff_assignment_user_id_idx" ON "cage_staff_assignment"("user_id");

ALTER TABLE "cage_staff_assignment" ADD CONSTRAINT "cage_staff_assignment_cage_id_fkey" FOREIGN KEY ("cage_id") REFERENCES "Cage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cage_staff_assignment" ADD CONSTRAINT "cage_staff_assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

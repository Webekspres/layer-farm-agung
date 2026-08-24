-- CreateTable
CREATE TABLE "tenant_production_setting" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "staff_lookback_days" INTEGER NOT NULL DEFAULT 7,
    "admin_lookback_days" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_production_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_production_setting_tenant_id_key" ON "tenant_production_setting"("tenant_id");

-- AddForeignKey
ALTER TABLE "tenant_production_setting" ADD CONSTRAINT "tenant_production_setting_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: setiap tenant yang sudah ada mendapat kebijakan default (staff 7 hari, admin 30 hari).
INSERT INTO "tenant_production_setting" ("id", "tenant_id", "staff_lookback_days", "admin_lookback_days", "created_at", "updated_at")
SELECT gen_random_uuid(), "id", 7, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Tenant"
ON CONFLICT ("tenant_id") DO NOTHING;

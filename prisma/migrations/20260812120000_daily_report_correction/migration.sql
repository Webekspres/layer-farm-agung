-- Soft DailyReport parent + immutable DailyInputCorrection (GAP-007 / GAP-017)

CREATE TABLE "DailyReport" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cage_id" UUID NOT NULL,
    "record_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyReport_tenant_id_cage_id_record_date_key" ON "DailyReport"("tenant_id", "cage_id", "record_date");
CREATE INDEX "DailyReport_cage_id_record_date_idx" ON "DailyReport"("cage_id", "record_date");

ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_cage_id_fkey" FOREIGN KEY ("cage_id") REFERENCES "Cage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "DailyInputCorrection" (
    "id" UUID NOT NULL,
    "daily_report_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "client_mutation_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyInputCorrection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyInputCorrection_client_mutation_id_key" ON "DailyInputCorrection"("client_mutation_id");
CREATE INDEX "DailyInputCorrection_daily_report_id_created_at_idx" ON "DailyInputCorrection"("daily_report_id", "created_at");

ALTER TABLE "DailyInputCorrection" ADD CONSTRAINT "DailyInputCorrection_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "DailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyInputCorrection" ADD CONSTRAINT "DailyInputCorrection_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

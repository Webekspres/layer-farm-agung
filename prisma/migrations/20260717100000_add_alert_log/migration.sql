CREATE TABLE "AlertLog" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "alert_key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'Warning',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "source_id" UUID,
    "record_date" DATE,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AlertLog_tenant_id_alert_key_key" ON "AlertLog"("tenant_id", "alert_key");
CREATE INDEX "AlertLog_tenant_id_is_read_created_at_idx" ON "AlertLog"("tenant_id", "is_read", "created_at");
CREATE INDEX "AlertLog_tenant_id_type_record_date_idx" ON "AlertLog"("tenant_id", "type", "record_date");

ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

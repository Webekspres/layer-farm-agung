CREATE TABLE "DeliveryLog" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sale_id" UUID NOT NULL,
    "delivery_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Delivered',
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeliveryLog_tenant_id_delivery_date_idx" ON "DeliveryLog"("tenant_id", "delivery_date");
CREATE INDEX "DeliveryLog_sale_id_idx" ON "DeliveryLog"("sale_id");

ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "app_notification" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "app_notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_device_token" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_device_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "app_notification_user_id_is_read_created_at_idx" ON "app_notification"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "app_notification_tenant_id_type_idx" ON "app_notification"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "push_device_token_token_key" ON "push_device_token"("token");

-- CreateIndex
CREATE INDEX "push_device_token_user_id_idx" ON "push_device_token"("user_id");

-- AddForeignKey
ALTER TABLE "app_notification" ADD CONSTRAINT "app_notification_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_notification" ADD CONSTRAINT "app_notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_device_token" ADD CONSTRAINT "push_device_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

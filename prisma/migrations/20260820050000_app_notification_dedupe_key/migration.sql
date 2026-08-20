-- AlterTable
ALTER TABLE "app_notification" ADD COLUMN "dedupe_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "app_notification_user_id_dedupe_key_key" ON "app_notification"("user_id", "dedupe_key");
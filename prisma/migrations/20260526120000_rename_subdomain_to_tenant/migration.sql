-- Rebrand Subdomain → Tenant (table + FK columns)

ALTER TABLE "Subdomain" RENAME TO "Tenant";
ALTER TABLE "Tenant" RENAME COLUMN "subdomain_url" TO "slug";
ALTER INDEX "Subdomain_pkey" RENAME TO "Tenant_pkey";
ALTER INDEX "Subdomain_subdomain_url_key" RENAME TO "Tenant_slug_key";

ALTER TABLE "User" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "session" RENAME COLUMN "active_subdomain_id" TO "active_tenant_id";

ALTER TABLE "Location" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "Vendor" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "Item" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "DailyProduction" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "SyncQueue" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "Customer" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "SalesOrder" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "OpexCategory" RENAME COLUMN "subdomain_id" TO "tenant_id";
ALTER TABLE "CashflowTransaction" RENAME COLUMN "subdomain_id" TO "tenant_id";

ALTER TABLE "User" RENAME CONSTRAINT "User_subdomain_id_fkey" TO "User_tenant_id_fkey";
ALTER TABLE "Location" RENAME CONSTRAINT "Location_subdomain_id_fkey" TO "Location_tenant_id_fkey";
ALTER TABLE "Vendor" RENAME CONSTRAINT "Vendor_subdomain_id_fkey" TO "Vendor_tenant_id_fkey";
ALTER TABLE "Item" RENAME CONSTRAINT "Item_subdomain_id_fkey" TO "Item_tenant_id_fkey";
ALTER TABLE "DailyProduction" RENAME CONSTRAINT "DailyProduction_subdomain_id_fkey" TO "DailyProduction_tenant_id_fkey";
ALTER TABLE "SyncQueue" RENAME CONSTRAINT "SyncQueue_subdomain_id_fkey" TO "SyncQueue_tenant_id_fkey";
ALTER TABLE "Customer" RENAME CONSTRAINT "Customer_subdomain_id_fkey" TO "Customer_tenant_id_fkey";
ALTER TABLE "SalesOrder" RENAME CONSTRAINT "SalesOrder_subdomain_id_fkey" TO "SalesOrder_tenant_id_fkey";
ALTER TABLE "OpexCategory" RENAME CONSTRAINT "OpexCategory_subdomain_id_fkey" TO "OpexCategory_tenant_id_fkey";
ALTER TABLE "CashflowTransaction" RENAME CONSTRAINT "CashflowTransaction_subdomain_id_fkey" TO "CashflowTransaction_tenant_id_fkey";

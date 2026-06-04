import Link from "next/link";
import { Smartphone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default async function ProductionPage() {
  await requirePermission("manage_production");

  return (
    <>
      <PageHeader
        title="Produksi"
        description="Pencatatan produksi telur harian dan monitoring kandang."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/kandang">
            <Smartphone className="size-4" />
            Input lapangan (PWA)
          </Link>
        </Button>
      </div>
      <ComingSoonPanel />
    </>
  );
}

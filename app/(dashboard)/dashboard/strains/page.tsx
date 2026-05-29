import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { StrainsManagement } from "@/features/strains/components/strains-management";
import { parseStrainListFilters } from "@/features/strains/lib/parse-filters";
import { listStrains } from "@/features/strains/services/list-strains";

import { parsePage, parsePageSize } from "@/lib/pagination";

type StrainsPageProps = {
  searchParams: Promise<{
    q?: string;
    usage?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function StrainsPage({ searchParams }: StrainsPageProps) {
  await requireManageGlobalCatalogSession();
  const params = await searchParams;
  const filters = parseStrainListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const result = await listStrains({ ...filters, page, pageSize });

  return (
    <>
      <PageHeader
        title="Strain"
        description="Katalog strain global (AAPM / superadmin). Admin tenant hanya memilih strain saat mengatur kandang."
      />
      <Suspense fallback={null}>
        <StrainsManagement
          strains={result.items}
          pagination={{
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          }}
        />
      </Suspense>
    </>
  );
}

import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { EggGradesManagement } from "@/features/egg-grades/components/egg-grades-management";
import { parseEggGradeListFilters } from "@/features/egg-grades/lib/parse-filters";
import { listEggGrades } from "@/features/egg-grades/services/list-egg-grades";

type EggGradesPageProps = {
  searchParams: Promise<{ q?: string; usage?: string }>;
};

export default async function EggGradesPage({ searchParams }: EggGradesPageProps) {
  await requireManageGlobalCatalogSession();
  const params = await searchParams;
  const filters = parseEggGradeListFilters(params);
  const grades = await listEggGrades(filters);

  return (
    <>
      <PageHeader
        title="Grade telur"
        description="Katalog grade telur global (AAPM / superadmin). Admin tenant memakai grade ini di operasional nanti."
      />
      <Suspense fallback={null}>
        <EggGradesManagement grades={grades} />
      </Suspense>
    </>
  );
}

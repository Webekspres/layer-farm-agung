import { listLocationOptions } from "@/features/locations/services/list-locations";
import { listStrainOptions } from "@/features/strains/services/list-strains";
import type { CageFormOptions } from "@/features/cages/types";

export async function getCageFormOptions(
  tenantId: string,
): Promise<CageFormOptions> {
  const [locations, strains] = await Promise.all([
    listLocationOptions(tenantId),
    listStrainOptions(),
  ]);

  return { locations, strains };
}

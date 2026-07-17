import { VACCINE_SCHEDULE_STATUSES } from "@/features/health/types";
import type { VaccineScheduleListFilters } from "@/features/health/types";

export function parseVaccineScheduleListFilters(params: {
  q?: string;
  status?: string;
}): VaccineScheduleListFilters {
  const status = (VACCINE_SCHEDULE_STATUSES as readonly string[]).includes(
    params.status ?? "",
  )
    ? (params.status as VaccineScheduleListFilters["status"])
    : undefined;

  return {
    search: params.q,
    status,
  };
}

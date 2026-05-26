import type {
  LocationOccupancyFilter,
  LocationsListFilters,
} from "@/features/locations/types";

export function parseLocationListFilters(params: {
  q?: string;
  occupancy?: string;
}): LocationsListFilters {
  const occupancy = params.occupancy;
  const validOccupancy: LocationOccupancyFilter[] = [
    "with_cages",
    "empty",
  ];
  const occupancyFilter: LocationOccupancyFilter =
    occupancy && validOccupancy.includes(occupancy as LocationOccupancyFilter)
      ? (occupancy as LocationOccupancyFilter)
      : "all";

  return {
    search: params.q,
    occupancy: occupancyFilter === "all" ? undefined : occupancyFilter,
  };
}

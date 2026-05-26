export type LocationOccupancyFilter = "all" | "with_cages" | "empty";

export type LocationsListFilters = {
  search?: string;
  occupancy?: LocationOccupancyFilter;
};

export type LocationListItem = {
  id: string;
  name: string;
  cageCount: number;
  createdAt: string;
};

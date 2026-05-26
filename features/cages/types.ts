export type CageStatusFilter = "all" | "Active" | "Inactive";

export type CagesListFilters = {
  search?: string;
  locationId?: string;
  strainId?: number;
  status?: CageStatusFilter;
};

export type CageListItem = {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  strainId: number;
  strainName: string;
  cageType: string | null;
  capacity: number;
  status: string;
  activeCyclePopulation: number | null;
};

export type CageFormOptions = {
  locations: { id: string; name: string }[];
  strains: { id: number; name: string }[];
};

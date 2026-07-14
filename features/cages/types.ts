// Diubah konsepnya mencerminkan manajemen arsip (all, Active, Archived)
export type CageStatusFilter = "all" | "Active" | "Archived";
// Menambahkan opsi filter siklus baru
export type CageCycleStatusFilter = "all" | "Active" | "Inactive";

export type CagesListFilters = {
  search?: string;
  locationId?: string;
  strainId?: number;
  status?: CageStatusFilter;
  cycleStatus?: CageCycleStatusFilter; // 👈 Tambah filter siklus baru
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
  activeCycleStartDate: string | null;
};

export type CageFormOptions = {
  locations: { id: string; name: string }[];
  strains: { id: number; name: string }[];
};

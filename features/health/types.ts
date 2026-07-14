export const VACCINE_SCHEDULE_STATUSES = ["Pending", "Completed", "Cancelled"] as const;

export type VaccineScheduleStatus = (typeof VACCINE_SCHEDULE_STATUSES)[number];

export type VaccineScheduleListFilters = {
  search?: string;
  status?: VaccineScheduleStatus;
};

export type VaccineScheduleListItem = {
  id: string;
  cageId: string;
  cageName: string;
  locationName: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  scheduledDate: string;
  status: VaccineScheduleStatus;
  notes: string | null;
  quantityUsed: number | null;
  completedAt: string | null;
  createdAt: string;
};

export type VaccineScheduleFormOptions = {
  cages: { id: string; name: string; locationName: string }[];
  vaccineItems: { id: string; name: string; unit: string }[];
};

/** Pending schedule surfaced to mobile staff for a given cage. */
export type PendingVaccineScheduleItem = {
  id: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  scheduledDate: string;
  status: VaccineScheduleStatus;
  notes: string | null;
};

import type {
  CageStatusFilter,
  CageCycleStatusFilter,
  CagesListFilters,
} from "@/features/cages/types";

export function parseCageListFilters(params: {
  q?: string;
  location?: string;
  strain?: string;
  status?: string;
  cycleStatus?: string;
}): CagesListFilters {
  // 🔒 1. Parse Filter Status Master (Arsip vs Aktif)
  const status = params.status;
  const validStatus: CageStatusFilter[] = ["Active", "Archived", "all"];
  const statusFilter: CageStatusFilter =
    status && validStatus.includes(status as CageStatusFilter)
      ? (status as CageStatusFilter)
      : "Active"; // Default tetap menampilkan yang operasional (Active)

  // 🟢 2. ➕ Parse Filter Kondisi Siklus Ayam Baru
  const cycleStatus = params.cycleStatus;
  const validCycleStatus: CageCycleStatusFilter[] = [
    "Active",
    "Inactive",
    "all",
  ];
  const cycleStatusFilter: CageCycleStatusFilter =
    cycleStatus &&
    validCycleStatus.includes(cycleStatus as CageCycleStatusFilter)
      ? (cycleStatus as CageCycleStatusFilter)
      : "all"; // Default menampilkan semua siklus

  const strainRaw = params.strain?.trim();
  const strainId =
    strainRaw && strainRaw !== "all" && /^\d+$/.test(strainRaw)
      ? Number(strainRaw)
      : undefined;

  const locationRaw = params.location?.trim();
  const locationId =
    locationRaw && locationRaw !== "all" ? locationRaw : undefined;

  return {
    search: params.q?.trim() || undefined,
    locationId,
    strainId,
    status: statusFilter, // 👈 Lempar string filternya utuh ("Active" / "Archived" / "all") agar diolah dengan benar oleh buildWhere di service
    cycleStatus: cycleStatusFilter, // 👈 ➕ Kembalikan filter siklus baru
  };
}

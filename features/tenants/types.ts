export type TenantListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
};

export type TenantsListFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

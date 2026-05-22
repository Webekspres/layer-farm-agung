export type SubdomainListItem = {
  id: string;
  name: string;
  subdomainUrl: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
};

export type SubdomainsListFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

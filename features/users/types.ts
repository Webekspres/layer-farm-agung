export type UserListItem = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  isActive: boolean;
  roleId: number;
  roleName: string;
  subdomainId: string | null;
  subdomainName: string | null;
  createdAt: string;
};

export type UserFormOptions = {
  roles: { id: number; name: string }[];
  subdomains: { id: string; name: string }[];
  isGlobalAdmin: boolean;
  defaultSubdomainId: string | null;
};

export type UsersListFilters = {
  search?: string;
  roleId?: number;
  subdomainId?: string;
  status?: "all" | "active" | "inactive";
};

export type UsersPaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

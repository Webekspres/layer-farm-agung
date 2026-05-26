export type UserListItem = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  isActive: boolean;
  roleId: number;
  roleName: string;
  tenantId: string | null;
  tenantName: string | null;
  createdAt: string;
};

export type UserFormOptions = {
  roles: { id: number; name: string }[];
  tenants: { id: string; name: string }[];
  isGlobalAdmin: boolean;
  defaultTenantId: string | null;
};

export type UsersListFilters = {
  search?: string;
  roleId?: number;
  tenantId?: string;
  status?: "all" | "active" | "inactive";
};

export type UsersPaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

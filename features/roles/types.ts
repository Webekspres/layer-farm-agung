export type PermissionItem = {
  id: number;
  name: string;
};

export type RoleWithPermissions = {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  permissionIds: number[];
};

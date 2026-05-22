import {
  ADMIN_ROLE_NAME,
  STAFF_ROLE_NAME,
  SUPERADMIN_ROLE_NAME,
} from "@/features/roles/config/system-roles";

export { ADMIN_ROLE_NAME, STAFF_ROLE_NAME, SUPERADMIN_ROLE_NAME };

export type RoleOption = { id: number; name: string };

export function findRoleById(roleId: string, roles: RoleOption[]) {
  return roles.find((role) => String(role.id) === String(roleId));
}

export function isSuperadminRole(roleId: string, roles: RoleOption[]) {
  return findRoleById(roleId, roles)?.name === SUPERADMIN_ROLE_NAME;
}

/** Branch admins cannot assign the superadmin role when creating/editing users. */
export function filterAssignableRoles(
  roles: RoleOption[],
  isGlobalAdmin: boolean,
) {
  if (isGlobalAdmin) return roles;
  return roles.filter((role) => role.name !== SUPERADMIN_ROLE_NAME);
}

/** UI: superadmin must use global; other roles must pick a branch id. */
export function subdomainIdAfterRoleChange(
  nextRoleId: string,
  currentSubdomainId: string,
  roles: RoleOption[],
  branches: { id: string }[],
  fallbackBranchId?: string | null,
): string {
  if (isSuperadminRole(nextRoleId, roles)) {
    return "global";
  }

  if (currentSubdomainId && currentSubdomainId !== "global") {
    return currentSubdomainId;
  }

  return fallbackBranchId ?? branches[0]?.id ?? "";
}

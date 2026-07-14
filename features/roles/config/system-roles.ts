import { WIRED_PERMISSIONS } from "@/features/permissions/config/wired-permissions";

/** Canonical role keys — must match `Role.name` in the database. */
export const SUPERADMIN_ROLE_NAME = "superadmin";
export const ADMIN_ROLE_NAME = "admin";
export const STAFF_ROLE_NAME = "staff";

export const SYSTEM_ROLE_ORDER = [
  SUPERADMIN_ROLE_NAME,
  ADMIN_ROLE_NAME,
  STAFF_ROLE_NAME,
] as const;

export type SystemRoleName = (typeof SYSTEM_ROLE_ORDER)[number];

export type SystemRoleDefinition = {
  name: SystemRoleName;
  description: string;
  /** Permission names assigned on seed / reset. `all` = every wired permission. */
  permissions: readonly string[] | "all";
  /** Role matrix in UI cannot be edited (superadmin only). */
  permissionsReadOnly?: boolean;
};

/**
 * Default RBAC for Agung Petelur.
 * - superadmin: global, full access
 * - admin: tenant master data only (no manage_roles, no manage_global_catalog)
 * - staff: operasional (produksi + inventori), for Domain 2+ field workflows
 */
const TENANT_ADMIN_EXCLUDED_PERMISSIONS = [
  "manage_roles",
  "manage_global_catalog",
] as const;

export const SYSTEM_ROLES: Record<SystemRoleName, SystemRoleDefinition> = {
  [SUPERADMIN_ROLE_NAME]: {
    name: SUPERADMIN_ROLE_NAME,
    description: "Superadmin global (semua tenant)",
    permissions: "all",
    permissionsReadOnly: true,
  },
  [ADMIN_ROLE_NAME]: {
    name: ADMIN_ROLE_NAME,
    description: "Admin tenant",
    permissions: WIRED_PERMISSIONS.filter(
      (p) => !(TENANT_ADMIN_EXCLUDED_PERMISSIONS as readonly string[]).includes(p),
    ),
  },
  [STAFF_ROLE_NAME]: {
    name: STAFF_ROLE_NAME,
    description: "Staff operasional / petugas kandang",
    permissions: ["view_dashboard", "manage_production", "manage_inventory"],
  },
};

export function sortRolesBySystemOrder<T extends { name: string }>(roles: T[]): T[] {
  const orderIndex = (name: string) => {
    const i = SYSTEM_ROLE_ORDER.indexOf(name as SystemRoleName);
    return i === -1 ? SYSTEM_ROLE_ORDER.length : i;
  };
  return [...roles].sort((a, b) => orderIndex(a.name) - orderIndex(b.name));
}

export function resolveRolePermissionNames(
  definition: SystemRoleDefinition,
): readonly string[] {
  return definition.permissions === "all"
    ? WIRED_PERMISSIONS
    : definition.permissions;
}

export function isSystemRoleName(name: string): name is SystemRoleName {
  return (SYSTEM_ROLE_ORDER as readonly string[]).includes(name);
}

/** Default permission keys for a system role; null if role has no seed defaults. */
export function getDefaultPermissionNamesForRole(
  roleName: string,
): readonly string[] | null {
  if (!isSystemRoleName(roleName)) return null;
  return resolveRolePermissionNames(SYSTEM_ROLES[roleName]);
}

export function defaultPermissionIdsForRole(
  roleName: string,
  permissions: readonly { id: number; name: string }[],
): number[] | null {
  const names = getDefaultPermissionNamesForRole(roleName);
  if (!names) return null;
  const allowed = new Set(names);
  return permissions.filter((p) => allowed.has(p.name)).map((p) => p.id);
}

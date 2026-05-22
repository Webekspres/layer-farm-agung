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
 * - admin: cabang admin (no manage_roles)
 * - staff: operasional (produksi + inventori), for Domain 2+ field workflows
 */
export const SYSTEM_ROLES: Record<SystemRoleName, SystemRoleDefinition> = {
  [SUPERADMIN_ROLE_NAME]: {
    name: SUPERADMIN_ROLE_NAME,
    description: "Superadmin global (semua cabang)",
    permissions: "all",
    permissionsReadOnly: true,
  },
  [ADMIN_ROLE_NAME]: {
    name: ADMIN_ROLE_NAME,
    description: "Admin cabang",
    permissions: WIRED_PERMISSIONS.filter((p) => p !== "manage_roles"),
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

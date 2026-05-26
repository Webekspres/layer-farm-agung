/**
 * Permission keys referenced in app code (routes, actions, navigation).
 * New DB permissions only take effect after a matching check is added in code.
 */
export const WIRED_PERMISSIONS = [
  "view_dashboard",
  "manage_users",
  "manage_roles",
  "manage_master_data",
  "manage_global_catalog",
  "view_cashflow",
  "manage_production",
  "manage_inventory",
] as const;

export type WiredPermission = (typeof WIRED_PERMISSIONS)[number];

export function isWiredPermission(name: string): name is WiredPermission {
  return (WIRED_PERMISSIONS as readonly string[]).includes(name);
}

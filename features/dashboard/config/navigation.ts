import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Building2,
  ClipboardList,
  Egg,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  Shield,
  Syringe,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
  /** Only visible when user has null tenant_id (global superadmin). */
  globalOnly?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Ringkas — kerja lapangan / rekap harian. */
export const operationsNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    title: "Input harian",
    href: "/dashboard/production",
    icon: Egg,
    permission: "manage_production",
  },
  {
    title: "Vaksinasi",
    href: "/dashboard/health/vaccines",
    icon: Syringe,
    permission: "manage_production",
  },
];

/** Inventori Saprodi (pakan, obat, vaksin, vitamin); PO & ledger mutasi. */
export const stockNavItems: NavItem[] = [
  {
    title: "Inventori",
    href: "/dashboard/inventory",
    icon: Package,
    permission: "manage_inventory",
  },
  {
    title: "Mutasi stok",
    href: "/dashboard/inventory/mutations",
    icon: ArrowRightLeft,
    permission: "manage_inventory",
  },
  {
    title: "Pesanan pembelian",
    href: "/dashboard/purchase-orders",
    icon: ClipboardList,
    permission: "manage_inventory",
  },
];

export const financeNavItems: NavItem[] = [
  {
    title: "Keuangan",
    href: "/dashboard/finance",
    icon: Wallet,
    permission: "view_cashflow",
  },
];

/** @deprecated Prefer `primaryNavGroups` — flat list for breadcrumbs/legacy. */
export const mainNavItems: NavItem[] = [
  ...operationsNavItems,
  ...stockNavItems,
  ...financeNavItems,
];

export const masterDataNavItems: NavItem[] = [
  {
    title: "Lokasi",
    href: "/dashboard/locations",
    icon: MapPin,
    permission: "manage_master_data",
  },
  {
    title: "Kandang",
    href: "/dashboard/cages",
    icon: Layers,
    permission: "manage_master_data",
  },
  {
    title: "Strain",
    href: "/dashboard/strains",
    icon: Egg,
    permission: "manage_global_catalog",
    globalOnly: true,
  },
  {
    title: "Grade Telur",
    href: "/dashboard/egg-grades",
    icon: Package,
    permission: "manage_global_catalog",
    globalOnly: true,
  },
  {
    title: "Vendor",
    href: "/dashboard/vendors",
    icon: Truck,
    permission: "manage_master_data",
  },
];

export const adminNavItems: NavItem[] = [
  {
    title: "Tenant",
    href: "/dashboard/tenants",
    icon: Building2,
    permission: "manage_roles",
    globalOnly: true,
  },
  {
    title: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    permission: "manage_users",
  },
  {
    title: "Peran & Akses",
    href: "/dashboard/roles",
    icon: Shield,
    permission: "manage_roles",
  },
];

export const primaryNavGroups: NavGroup[] = [
  { label: "Operasional", items: operationsNavItems },
  { label: "Stok & pembelian", items: stockNavItems },
  { label: "Keuangan", items: financeNavItems },
];

export function filterNavByPermissions(
  items: NavItem[],
  permissions: string[] | undefined,
  isGlobalAdmin: boolean,
) {
  return items.filter((item) => {
    if (item.globalOnly && !isGlobalAdmin) return false;
    return !item.permission || permissions?.includes(item.permission);
  });
}

function normalizePathname(pathname: string) {
  return pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

/**
 * Active state for flat sidebar links. Prefers the longest matching sibling
 * href so `/dashboard/inventory/mutations` does not also light up Inventori.
 */
export function isNavItemActive(
  pathname: string,
  href: string,
  siblingHrefs: string[],
): boolean {
  const current = normalizePathname(pathname);

  if (href === "/dashboard") {
    return current === "/dashboard";
  }

  const matches = current === href || current.startsWith(`${href}/`);
  if (!matches) return false;

  const hasMoreSpecificSibling = siblingHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      other.startsWith(`${href}/`) &&
      (current === other || current.startsWith(`${other}/`)),
  );

  return !hasMoreSpecificSibling;
}

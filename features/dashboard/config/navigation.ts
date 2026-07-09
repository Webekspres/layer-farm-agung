import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  Egg,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  Shield,
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

export const mainNavItems: NavItem[] = [
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
    title: "Inventori",
    href: "/dashboard/inventory",
    icon: Package,
    permission: "manage_inventory",
  },
  {
    title: "Pesanan pembelian",
    href: "/dashboard/purchase-orders",
    icon: ClipboardList,
    permission: "manage_inventory",
  },
  {
    title: "Keuangan",
    href: "/dashboard/finance",
    icon: Wallet,
    permission: "view_cashflow",
    badge: "Soon",
  },
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

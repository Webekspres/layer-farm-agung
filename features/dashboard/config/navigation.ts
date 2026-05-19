import type { LucideIcon } from "lucide-react";
import {
  Egg,
  LayoutDashboard,
  Package,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
};

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    title: "Produksi",
    href: "/dashboard/production",
    icon: Egg,
    permission: "manage_production",
    badge: "Soon",
  },
  {
    title: "Inventori",
    href: "/dashboard/inventory",
    icon: Package,
    permission: "manage_inventory",
    badge: "Soon",
  },
  {
    title: "Keuangan",
    href: "/dashboard/finance",
    icon: Wallet,
    permission: "view_cashflow",
    badge: "Soon",
  },
];

export const adminNavItems: NavItem[] = [
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
    badge: "Soon",
  },
];

export function filterNavByPermissions(
  items: NavItem[],
  permissions: string[] | undefined,
) {
  return items.filter(
    (item) => !item.permission || permissions?.includes(item.permission),
  );
}

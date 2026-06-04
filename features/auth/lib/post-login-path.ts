import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";

export function getPostLoginPath(roleName: string | undefined | null) {
  return roleName === STAFF_ROLE_NAME ? "/kandang" : "/dashboard";
}

export function isStaffRole(roleName: string | undefined | null) {
  return roleName === STAFF_ROLE_NAME;
}

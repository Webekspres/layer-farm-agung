import {
  normalizeBusinessDate,
  shiftBusinessDate,
  startOfTodayBusiness,
} from "@/lib/business-date";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import prisma from "@/lib/prisma";

/** Default kebijakan saat tenant belum punya baris setting (fallback). */
export const DEFAULT_STAFF_LOOKBACK_DAYS = 7;
export const DEFAULT_ADMIN_LOOKBACK_DAYS = 30;

/** Role user pemanggil — menentukan batas lookback yang berlaku. */
export async function resolveUserRoleName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  return user?.role.name ?? STAFF_ROLE_NAME;
}

export type InputWindow = {
  /** Batas paling awal tanggal operasional yang diizinkan (inklusif). */
  minDate: Date;
  /** Batas paling akhir (hari ini WIB, inklusif). */
  maxDate: Date;
  /** Jumlah hari lookback yang berlaku utk role pemanggil. */
  lookbackDays: number;
  /** Role yang menentukan lookback (staff vs admin). */
  roleName: string;
};

export type InputWindowValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Ambil kebijakan lookback per tenant, dengan fallback default (7/30).
 * `roleName` menentukan batas mana yang dipakai (staff vs selain staff).
 */
export async function resolveInputWindow(
  tenantId: string,
  roleName: string,
  now = new Date(),
): Promise<InputWindow> {
  const setting = await prisma.tenantProductionSetting.findUnique({
    where: { tenant_id: tenantId },
    select: { staff_lookback_days: true, admin_lookback_days: true },
  });

  const isStaff = roleName === STAFF_ROLE_NAME;
  const lookbackDays = isStaff
    ? (setting?.staff_lookback_days ?? DEFAULT_STAFF_LOOKBACK_DAYS)
    : (setting?.admin_lookback_days ?? DEFAULT_ADMIN_LOOKBACK_DAYS);

  const maxDate = startOfTodayBusiness(now);
  const minDate = shiftBusinessDate(maxDate, -lookbackDays);

  return { minDate, maxDate, lookbackDays, roleName };
}

/** Cek tanggal terhadap batas lookback (tolak sebelum minDate / setelah maxDate). */
export function validateDateInLookbackWindow(
  recordDate: Date,
  window: Pick<InputWindow, "minDate" | "maxDate" | "lookbackDays">,
): InputWindowValidationResult {
  const date = normalizeBusinessDate(recordDate);

  if (date.getTime() < window.minDate.getTime()) {
    return {
      ok: false,
      error: `Tanggal di luar batas input: maksimal ${window.lookbackDays} hari ke belakang dari hari ini.`,
    };
  }

  if (date.getTime() > window.maxDate.getTime()) {
    return {
      ok: false,
      error: "Tanggal tidak boleh di masa depan.",
    };
  }

  return { ok: true };
}

/**
 * Cek tanggal terhadap rentang siklus aktif kandang.
 * `cycle` boleh null saat kandang tidak punya siklus aktif — validasi
 * keberadaan siklus tetap dilakukan di service masing-masing.
 */
export function validateDateInCycle(
  recordDate: Date,
  cycle: { start_date: Date; end_date: Date | null } | null,
): InputWindowValidationResult {
  if (!cycle) {
    return { ok: true };
  }

  const date = normalizeBusinessDate(recordDate);
  const start = normalizeBusinessDate(cycle.start_date);

  if (date.getTime() < start.getTime()) {
    return {
      ok: false,
      error: "Tanggal sebelum dimulainya siklus (start_date) tidak dapat dicatat.",
    };
  }

  if (cycle.end_date) {
    const end = normalizeBusinessDate(cycle.end_date);
    if (date.getTime() > end.getTime()) {
      return {
        ok: false,
        error: "Tanggal setelah selesainya siklus tidak dapat dicatat.",
      };
    }
  }

  return { ok: true };
}

/**
 * Validasi gabungan utk tanggal operasional: lookback (per role) + rentang
 * siklus aktif kandang. Dipanggil service create/update setelah cek
 * `validateOperationalBusinessDate` (masa depan) berhasil.
 */
export async function validateOperationalInputDate(params: {
  tenantId: string;
  roleName: string;
  recordDate: Date;
  cycle: { start_date: Date; end_date: Date | null } | null;
  now?: Date;
}): Promise<InputWindowValidationResult> {
  const window = await resolveInputWindow(
    params.tenantId,
    params.roleName,
    params.now,
  );

  const lookback = validateDateInLookbackWindow(params.recordDate, window);
  if (!lookback.ok) {
    return lookback;
  }

  return validateDateInCycle(params.recordDate, params.cycle);
}

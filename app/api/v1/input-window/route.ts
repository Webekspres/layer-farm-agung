import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiSuccess } from "@/lib/api/response";
import { formatBusinessDate } from "@/lib/business-date";
import {
  resolveInputWindow,
} from "@/features/production/lib/input-window";
import prisma from "@/lib/prisma";

/**
 * Batas tanggal input/koreksi untuk user pemanggil (berdasarkan role & kebijakan
 * tenant). Opsional `cageId` untuk menyertakan batas siklus aktif kandang.
 * Dipakai Mobile utk date picker backfill.
 */
export async function GET(request: NextRequest) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const cageId = request.nextUrl.searchParams.get("cageId") ?? null;

  const window = await resolveInputWindow(
    auth.tenantId,
    auth.session.user.roleName ?? "",
  );

  let cycleBounds: { minDate: Date; maxDate: Date } | null = null;

  if (cageId) {
    const cycle = await prisma.cycleSetting.findFirst({
      where: { cage_id: cageId, status: "Active" },
      select: { start_date: true, go_live_date: true, end_date: true },
    });

    if (cycle) {
      cycleBounds = {
        // Periode Pra-Go-Live tidak bisa dicatat → batas bawah = go-live (fallback start_date).
        minDate: cycle.go_live_date ?? cycle.start_date,
        maxDate: cycle.end_date ?? window.maxDate,
      };
    }
  }

  // Batas efektif = irisan lookback tenant dengan rentang siklus aktif.
  const effectiveMin = cycleBounds
    ? new Date(Math.max(window.minDate.getTime(), cycleBounds.minDate.getTime()))
    : window.minDate;
  const effectiveMax = cycleBounds
    ? new Date(Math.min(window.maxDate.getTime(), cycleBounds.maxDate.getTime()))
    : window.maxDate;

  return apiSuccess(
    {
      minDate: formatBusinessDate(effectiveMin),
      maxDate: formatBusinessDate(effectiveMax),
      lookbackDays: window.lookbackDays,
      hasActiveCycle: cycleBounds !== null,
    },
    "Batas input berhasil dimuat.",
  );
}

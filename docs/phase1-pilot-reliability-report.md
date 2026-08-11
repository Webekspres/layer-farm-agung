# Phase 1 — Pilot Reliability report

**Date:** 2026-08-11  
**Scope:** PH1-A through PH1-H only. **No Phase 2.**  
**Authority:** Approved backlog in [gap-matrix-aapm.md](./gap-matrix-aapm.md).

## Outcomes

| Item | Result | Notes |
|------|--------|-------|
| **PH1-A** Assignment → cage list | **Pending device retest** | Code path already filters assigned cages; no code change this wave. Retest: assign/revoke → refresh online on Mobile. |
| **PH1-B** Active cycle (one-cycle) | **Pending device retest** + **pilot limit** | Create/read still tied to Active cycle check. Multi-cycle inheritance bug remains — pilot: one Active cycle; close-cycle warned on Web. |
| **PH1-C** Idempotency | **Unit OK** / **Pending device retest** | `client-mutation-id` tests pass (9 related tests). Retest double-tap / flush / reopen-with-queue on device. |
| **PH1-D** Correction refresh | **Implemented** | Edit forms clear cage history cache after successful save; screens pass `cageId` + `recordDate`. **Pending device confirm** that riwayat shows latest without full app reopen. |
| **PH1-E** Staff Web finance hide | **Implemented** | Staff keeps Web login. Dashboard hides revenue KPI, PO timeline, and finance charts without `view_cashflow`. Permissions not broadened. |
| **PH1-F** Pilot controls & KPI labels | **Implemented** | HDP/FCR labeled indikatif / bukan angka keputusan; close-cycle amber banner; Mobile Input list-first; Profile offline copy internet-first (no cold-start claim). **Add-on:** optional Scan QR shortcut restored (still not required); Web Cetak QR on cage detail. |
| **PH1-G** Version + pilot pack | **Implemented** | Mobile Profile version; Web Profile version; [pilot-guide-v1.md](./pilot-guide-v1.md); [pilot-ops-contact.md](./pilot-ops-contact.md) (fill contacts before go-live). |
| **PH1-H** Dashboard smoke | **Pending device retest** | Labels updated; compare population/production cards vs known inputs on one-cycle farm. |
| **GAP-012 ops add-on** Optional QR | **Implemented (not Phase 2)** | Reuses `qr_code` + `POST /api/v1/cages/scan` + assignment check. Does **not** close the full post-pilot QR/deep-link gate. |

## Code / docs touched (high level)

**Mobile:** history cache clear on correction; Profile offline + version; Input QR demoted.  
**Web:** dashboard finance gate; HDP/FCR labels; cage close-cycle pilot banner; Profile version.  
**Docs:** pilot guide, ops contact, this report, gap matrix status.

## Known limitations (pilot)

- One Active cycle per cage — do not close/reopen cycles in pilot.
- Internet-first; cold-start offline not supported.
- QR optional, not primary.
- Egg stock → sales not an active pilot capability.
- HDP/FCR not decision metrics.
- Cycle population inheritance across cycles still broken if multi-cycle used (out of Phase 1).

## Explicitly not done (Phase 2+)

`cycle_id` on daily tables, cold-start offline, QR-primary workflow, egg→sales activation, advanced correction audit.

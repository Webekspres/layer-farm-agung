# Phase 1 — Pilot Reliability report

**Date:** 2026-08-11 (code) · **Device retest notes:** 2026-08-12 — lihat [archive/phase1-device-retest-checklist.md](./archive/phase1-device-retest-checklist.md) (arsip; UAT formal: [UAT/README.md](./UAT/README.md))  
**Scope:** PH1-A through PH1-H only. **No Phase 2.**  
**Authority:** Approved backlog in [gap-matrix-aapm.md](./gap-matrix-aapm.md).

## Outcomes

| Item | Result | Notes |
|------|--------|-------|
| **PH1-A** Assignment → cage list | **PASS** (device 2026-08-12) | Update setelah refresh online; bukan wajib push realtime. |
| **PH1-B** Active cycle (one-cycle) | **PASS** (device 2026-08-12) | Input Mobile = Web. Multi-cycle inheritance bug remains — pilot: one Active cycle. |
| **PH1-C** Idempotency | **Unit OK** / **PENDING device** | Belum dijalankan di sesi 12 Agu; lihat cara tes di checklist. |
| **PH1-D** Correction refresh | **PASS** (device 2026-08-12) | Riwayat update tanpa restart app (keluar-masuk menu cukup). |
| **PH1-E** Staff Web finance hide | **Implemented** | Staff keeps Web login. Dashboard hides revenue KPI, PO timeline, and finance charts without `view_cashflow`. |
| **PH1-F** Pilot controls & KPI labels | **Implemented** | HDP/FCR indikatif; close-cycle warned; Input list-first; QR optional. |
| **PH1-G** Version + pilot pack | **Implemented** | Version UI + [pilot-guide-v1.md](./pilot-guide-v1.md); isi [pilot-ops-contact.md](./pilot-ops-contact.md) sebelum go-live. |
| **PH1-H** Dashboard smoke | **PASS** (device 2026-08-12) | Dashboard vs catatan sumber OK. |
| **GAP-012 ops add-on** Optional QR | **Implemented (not Phase 2)** | List primary; QR shortcut. |

## Code / docs touched (high level)

**Mobile:** history cache clear on correction; Profile offline + version; Input QR demoted.  
**Web:** dashboard finance gate; HDP/FCR labels; cage close-cycle pilot banner; Profile version.  
**Docs:** pilot guide, ops contact, this report, [device retest checklist](./archive/phase1-device-retest-checklist.md), gap matrix status.

## Known limitations (pilot)

- One Active cycle per cage — do not close/reopen cycles in pilot.
- Internet-first; cold-start offline not supported.
- QR optional, not primary.
- Egg stock → sales not an active pilot capability.
- HDP/FCR not decision metrics.
- Cycle population inheritance across cycles still broken if multi-cycle used (out of Phase 1).

## Explicitly not done (Phase 2+)

`cycle_id` on daily tables, cold-start offline, QR-primary workflow, egg→sales activation, advanced correction audit.

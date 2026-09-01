# Status UAT — Layer Farm Agung (AAPM)

| | |
|--|--|
| **Putaran final** | Web **v1.0.6** · APK **v1.0.6-build.30** |
| **Cakupan** | TC-01 s/d TC-05 (Revisi 1 §5) |
| **Status eksekusi** | **Selesai** |
| **Laporan ke klien** | **Dikirim** — 2026-09-01 |
| **Acuan bisnis** | Laporan Penyelarasan Revisi 1 — [`../handover/penyelarasan-revisi-1.md`](../handover/penyelarasan-revisi-1.md) |

---

## Dokumen resmi (repo ini)

| File | Fungsi |
|------|--------|
| [`UAT_Readiness_dan_Lembar_Eksekusi_TC01-TC05.pdf`](<UAT_Readiness_dan_Lembar_Eksekusi_TC01-TC05.pdf>) | Lembar eksekusi & readiness (PDF ke klien) |
| [`Berita Acara Uji Pembuktian dan Serah Terima Hasil UAT.pdf`](<Berita Acara Uji Pembuktian dan Serah Terima Hasil UAT.pdf>) | Berita acara serah terima UAT |
| [`README.md`](./README.md) | Indeks folder UAT |

---

## Arsip dev (opsional — workspace root)

Hanya tersedia jika repo backend berada di dalam workspace `aapm-workspace` bersama folder [`UAT/`](../../../UAT/) di root:

| Dokumen | Fungsi |
|---------|--------|
| [`UAT_Lembar_Eksekusi_TC01-TC05_v1.0.6-build.30.md`](../../../UAT/UAT_Lembar_Eksekusi_TC01-TC05_v1.0.6-build.30.md) | Lembar eksekusi markdown putaran final |
| [`revisi/UAT_Progress_Checklist.md`](../../../UAT/revisi/UAT_Progress_Checklist.md) | Checklist triage / fix / re-test |
| [`revisi/Triage_Temuan_TC01-TC05.md`](../../../UAT/revisi/Triage_Temuan_TC01-TC05.md) | Triage dev |

---

## Ringkasan TC

| TC | Fokus | Status |
|----|-------|--------|
| TC-01 | Mid-cycle + Pra-Go-Live + umur ayam | ✅ |
| TC-02 | Grade TB/TR/TP web ↔ Android | ✅ |
| TC-03 | Lookback & validasi tanggal | ✅ |
| TC-04 | Audit koreksi + reversal stok + offline | ✅ |
| TC-05 | Rekonsiliasi HDP & FCR (web / Android / spreadsheet) | ✅ |

Urutan eksekusi: **TC-01 → TC-02 → TC-03 → TC-05 → TC-04**.

---

## Implikasi gap matrix

- **GAP-014** (HDP/FCR) — **ditutup** (Revisi 1 §4 + TC-05).
- Detail: [`../gap-matrix-aapm.md`](../gap-matrix-aapm.md).

---

## Pasca-UAT

- Nonaktifkan akun seed UAT di produksi jika masih aktif.
- Pilot go-live: [`../pilot-guide-v1.md`](../pilot-guide-v1.md), [`../pilot-ops-contact.md`](../pilot-ops-contact.md).

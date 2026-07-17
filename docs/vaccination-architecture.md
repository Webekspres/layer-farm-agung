# Decision — Modul vaksinasi (operational schedule + age program)

**Accepted 2026-07-14** (jadwal operasional). **Extended 2026-07-17** (program berbasis umur).

Detail + mobile ADR mirror: [`aapm-mobile/docs/adr/002-vaccination-operational-schedule.md`](../../aapm-mobile/docs/adr/002-vaccination-operational-schedule.md).

## Ringkas

- Source of truth eksekusi: `VaccineSchedule` **per kandang + tanggal kalender** + complete → `OUT_VACCINE`.
- Master template: `VaccineProgram` + `VaccineProgramStep` (`age_days` sejak start siklus) → generator mengisi `VaccineSchedule` (`source=Program`, `program_step_id`).
- Excel Vaccine Regime = referensi seed/pola, bukan clone UI.
- Matching: program `strain_id` = strain kandang, fallback program `strain_id = null`.
- Auto-generate saat create siklus aktif; regenerate manual di detail kandang (idempotent per Pending + step).
- Mobile API tidak berubah — baca Pending schedule yang sudah digenerate.

## Admin

| Route | Fungsi |
|-------|--------|
| `/dashboard/health/vaccine-programs` | CRUD program + langkah |
| `/dashboard/health/vaccines` | Jadwal operasional (edit/cancel/complete) |
| `/dashboard/cages/[id]` | Tombol generate ulang dari program |

## Terkait operasional telur

Penjualan vs panen TB/TR/TP: [`egg-sales-stock.md`](./egg-sales-stock.md). Domain Egg Ledger vs Inventori Saprodi: [`egg-ledger-architecture.md`](./egg-ledger-architecture.md).

# Decision — Modul vaksinasi (operational schedule)

**Accepted 2026-07-14.** Detail + mobile ADR mirror: [`aapm-mobile/docs/adr/002-vaccination-operational-schedule.md`](../../aapm-mobile/docs/adr/002-vaccination-operational-schedule.md).

## Ringkas

- Source of truth: `VaccineSchedule` **per kandang + tanggal kalender** + complete → `OUT_VACCINE`.
- Bukan template-only strain/usia. Program usia (jika nanti) = generator ke tabel yang sama.
- Polish: due-today / overdue di mobile; complete boleh offline via outbox.

## Terkait operasional telur

Penjualan vs panen TB/TR/TP: [`egg-sales-stock.md`](./egg-sales-stock.md). Domain Egg Ledger vs Inventori Saprodi: [`egg-ledger-architecture.md`](./egg-ledger-architecture.md).

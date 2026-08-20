# Penjualan telur & stok gudang

**Accepted 2026-07-14, updated 2026-08-20 (per-grade stock + grade wajib).**

Architecture (domain vs inventori saprodi, per-grade tables): [`egg-ledger-architecture.md`](./egg-ledger-architecture.md).

## Ringkas

| Konsep | Peran |
|--------|--------|
| **Grade panen** (TB/TR/TP/…) | Semua grade aktif masuk stok jual via `IN_HARVEST` per **(grade × lokasi)** kandang |
| **Stok** | `EggStock` (saldo per grade × lokasi, tenant-isolated) + `EggMovement` (kartu stok) |
| **Penjualan** | Wajib `locationId` **dan** `eggGradeId` per baris; potong `OUT_SALES` per grade; gagal jika stok grade/lokasi kurang |
| **EggGrade** | Katalog harga + dimensi stok; baris sales **wajib** memilih grade (tanpa "tanpa grade") |
| **Berat** | Opsional (surat jalan); total uang = qty × harga satuan saja |
| **Inventori (UI)** | Saprodi only — telur tidak dibuat/dibeli/disesuaikan sebagai item inventori |
| **Menu** | Tab **Stok Telur** di `/dashboard/inventory`; kartu stok per grade di `/dashboard/inventory/eggs/[gradeId]` |

## Alur

```text
DailyProductionItem (grade × qty) ──IN_HARVEST──► EggStock(grade, location)  [Egg Ledger per grade]
                                                        │
SalesOrder (lokasi + grade + qty) ──OUT_SALES───────────┘
         └── CashflowTransaction Income
```

Koreksi produksi (update/hapus) membalik stok per grade: selisih naik → `IN_HARVEST`,
selisih turun / hapus → `OUT_ADJUSTMENT` (`allowNegative` untuk rekon).

## Migrasi historis

`scripts/migrate-egg-stock.ts` membangun ulang saldo dari `DailyProductionItem` −
`SalesOrderItem` per (grade × lokasi); baris sales lama tanpa grade dialokasikan ke
grade default (kode `TB`, fallback grade aktif pertama). Item `Egg` legacy beserta
`InventoryStock`/`StockMutation`-nya dihapus setelah saldo terbentuk.

## Di luar scope (saat ini)

- Delivery logs, harga harian otomatis
- Menjual non-telur
- Transfer antar grade (pemindahan klasifikasi telur) dan susut/afkir telur
- Menghapus halaman katalog Grade Telur (superadmin)
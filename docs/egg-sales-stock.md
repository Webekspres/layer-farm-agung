# Penjualan telur & stok gudang

**Accepted 2026-07-14.** Operasional lapangan = TB/TR/TP; penjualan = keluar stok telur bagus.

Architecture (domain vs inventori saprodi, Option A): [`egg-ledger-architecture.md`](./egg-ledger-architecture.md).

## Ringkas

| Konsep | Peran |
|--------|--------|
| **TB** (telur bagus) | Masuk stok via `IN_HARVEST` → `Item` tipe `Egg` per **lokasi** kandang (Egg Ledger) |
| **TR / TP** | Dicatat di produksi; **tidak** masuk pool stok jual |
| **Penjualan** | Wajib `locationId`; potong stok `OUT_SALES` (jumlah total butir semua baris); gagal jika stok lokasi kurang |
| **EggGrade** | Katalog / label harga **opsional** pada baris sales — **bukan** SKU stok |
| **Berat** | Opsional (surat jalan); total uang = qty × harga satuan saja |
| **Inventori (UI)** | Saprodi only — telur tidak dibuat/dibeli/disesuaikan sebagai item inventori |

## Alur

```text
DailyProduction.TB ──IN_HARVEST──► InventoryStock(Item Egg, location)  [= Egg Ledger]
                                         │
SalesOrder (lokasi + qty) ──OUT_SALES────┘
         └── CashflowTransaction Income
```

## Di luar scope (saat ini)

- Delivery logs, harga harian otomatis
- Menjual non-telur atau pool stok terpisah untuk TR/TP
- Menghapus halaman katalog Grade Telur (superadmin)
- Dedicated tabel `EggStock` / `EggMovement` (defer — Option B)

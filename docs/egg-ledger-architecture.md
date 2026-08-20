# Decision — Egg Ledger vs Inventori Saprodi

**Accepted 2026-07-14, updated 2026-08-20 (per-grade egg stock).**

## Verdict

| Layer | Decision |
|-------|----------|
| **Domain** | Production → **Egg Ledger** → Sales → Cashflow. Inventori = Saprodi only (Modul 8). |
| **Persistence** | Dedicated per-grade tables: `EggStock` (saldo grade × lokasi, tenant-isolated) + `EggMovement` (kartu stok). Legacy `ItemType.Egg` / `InventoryStock` / `StockMutation` untuk telur dihapus. |
| **Product** | Inventori UI/lists/PO/create/adjust exclude telur. Telur masuk via panen (`IN_HARVEST`) dan keluar via penjualan (`OUT_SALES`), keduanya per grade. |
| **Menu** | `/dashboard/inventory` bertab: **Stok Telur** vs **Pakan & Saprodi**; kartu stok per grade di `/dashboard/inventory/eggs/[gradeId]`. |

## Update 2026-08-20 — why dedicated per-grade tables

Divergence trigger terpenuhi (lihat juga `docs/source/Priority/08_ARAH...` + UAT #14):

1. **Stok per grade** — telur dipanen & dijual per grade (TB/TR/TP/...), bukan satu item agregat.
2. **Granularity berbeda dari saprodi** — telur berbasis butir, tanpa ambang stok rendah, tanpa PO/create/adjust, ledger berbasis grade.
3. **Tenant isolation eksplisit** — `EggStock`/`EggMovement` membawa `tenant_id` sendiri.

`applyStockMutation` (item saprodi) tetap dipakai untuk pakan/obat/vaksin; telur memakai `applyEggStockMutation` (`features/eggs/`). Kontrak API mobile `POST/PATCH/DELETE /api/v1/production` tidak berubah.

## Anti-patterns

- Modelling Egg Grade A/B/C sebagai inventori SKUs
- Membuat telur via Inventori / membeli telur via PO sebagai saprodi
- Memotong stok telur agregat tanpa grade (grade wajib di baris penjualan)
- Treating “stok kritis” dashboard sebagai termasuk telur jual (excluded)

## Refs

- Operational sales rules: [`egg-sales-stock.md`](./egg-sales-stock.md)
- Proposal: Modul 8 = Saprodi; Modul 11 = keluar gudang telur (not Modul 8 items)
# Decision — Egg Ledger vs Inventori Saprodi

**Accepted 2026-07-14.** Option A: shared stock engine, separate product domain.

## Verdict

| Layer | Decision |
|-------|----------|
| **Domain** | Production → **Egg Ledger** → Sales → Cashflow. Inventori = Saprodi only (Modul 8). |
| **Persistence** | Keep `ItemType.Egg` + `InventoryStock` / `StockMutation` / `applyStockMutation` (YAGNI). |
| **Product** | Inventori UI/lists/PO/create/adjust exclude Egg. Egg qty changes via panen (`IN_HARVEST`) and penjualan (`OUT_SALES`). |

Shared infrastructure ≠ shared domain. Do **not** introduce `EggStock` / `EggMovement` tables until divergence triggers (separate pools, permissions, or ledger semantics that fight inventori).

## Anti-patterns

- Modelling Egg Grade A/B/C as inventori SKUs
- Creating telur via Inventori / buying telur via PO as saprodi
- Treating “stok kritis” dashboard as including sellable eggs (excluded)

## Refs

- Operational sales rules: [`egg-sales-stock.md`](./egg-sales-stock.md)
- Proposal: Modul 8 = Saprodi; Modul 11 = keluar gudang telur (not Modul 8 items)

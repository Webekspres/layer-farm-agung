# Sitemap — Layered Farm Agung (AAPM)

**Living document** untuk melacak **rute admin web**, **API backend**, dan **progress implementasi**.  
Input lapangan (staff kandang) **bukan** di repo ini — lihat **§6**.

| | |
|--|--|
| **Terakhir diperbarui** | 2026-07-17 |
| **Progress proyek** | **~90%** keseluruhan (13 modul internal) · D3 ~98% · D4 ~80% — lihat [implementation_plan.md](./implementation_plan.md) |
| **Repo ini** | Next.js 16 — **admin dashboard + API provider** |
| **Mobile lapangan** | [`aapm-mobile`](../aapm-mobile) — React Native + Expo SDK 54 |
| **Ekosistem** | [`docs/ecosystem.md`](./ecosystem.md) |
| **Schema DB** | [`prisma/schema.prisma`](../prisma/schema.prisma) |
| **Nav kode** | [`features/dashboard/config/navigation.ts`](../features/dashboard/config/navigation.ts) |
| **Proteksi rute** | [`proxy.ts`](../proxy.ts) |

---

## 1. Arsitektur produk (pivot 2026-06)

| Aplikasi | Stack | Cakupan |
|----------|-------|---------|
| **AAPM Admin** (repo ini) | Next.js 16, shadcn, Prisma | CRUD master data, user/RBAC, rekap operasional, keuangan |
| **AAPM Mobile** ([`../aapm-mobile`](../aapm-mobile)) | React Native + Expo SDK 54 | Input harian kandang: produksi TB/TR/TP, pakan, populasi, pengobatan, QR |

**Scope hasil meeting:** produk ini adalah SaaS multi-tenant untuk manajemen peternakan ayam petelur. Role aplikasi tetap `superadmin` (operator platform), `admin` (tenant/peternak), dan `staff` (ABK kandang). Istilah “portal klien” pada proposal dipetakan ke dashboard tenant/admin, **bukan** portal buyer penjualan.

**Repo ini tidak lagi memakai Serwist / PWA.** Tidak ada service worker, manifest, atau rute `/kandang` / `/input-harian`.

Backend di repo ini menyediakan:
- **Better Auth** — `app/api/auth/*` (session/cookie; mobile Expo ✅)
- **Server Actions** — mutasi dari dashboard admin
- **Route Handlers** — `app/api/v1/*` operasional untuk mobile (✅ core endpoints)

**Tanggal operasional:** semua rekap/input memakai kalender **WIB** (`lib/business-date.ts`, `Asia/Jakarta`). Lihat [implementation_plan.md § Infra WIB](./implementation_plan.md#infra--tanggal-operasional-wib-selesai-2026-07-09).

---

## 2. Referensi bisnis (lokal, tidak di Git)

| Dokumen | Implikasi |
|---------|-----------|
| **Guidance strain Lohmann** | `Strain`, `ProductionTarget`, analytics HDP/FCR, program vaksin |
| **Program vaksinasi** | `VaccineSchedule`, `Item` — UI mobile + rekap admin (belum) |
| **Proposal Penawaran AAPM** | 13 modul; lihat [`Proposal Penawaran AAPM.md`](./Proposal%20Penawaran%20AAPM.md) |
| **Contoh laporan harian kelompok Ternak** | Format TB/TR/TP — diterapkan di mobile & rekap admin |

---

## 3. Legenda status

| Status | Arti |
|--------|------|
| ✅ **Done** | Rute/fitur jalan |
| 🟡 **Partial** | Rute ada; fitur belum lengkap |
| 🔲 **Planned** | Belum diimplementasi |
| 📱 **Mobile** | Dikerjakan di app React Native + Expo |

**Progress domain (perkiraan, 2026-07-17):**

| Domain | Fokus | Progress |
|--------|--------|----------|
| **D1** Identity & tenant | Auth, RBAC, users, tenants | ~95% |
| **D2** Master data | Lokasi, kandang, strain, grade, vendor, PO | ~90% |
| **D3** Operasional | Produksi, inventori, populasi ledger, sync, kesehatan | ~98% |
| **D4** Finansial | Penjualan + `OUT_SALES`, cashflow, KPI dashboard lite | ~80% |

---

## 4. Peran & akses (admin web)

| Peran | `/dashboard/*` | Catatan |
|-------|----------------|---------|
| **superadmin** | ✅ | Tenant switcher global |
| **admin** | ✅ | Master data + operasional tenant |
| **staff** | 🟡 | Bisa login dashboard; **penggunaan utama = app mobile** |

| Permission | Cakupan admin |
|------------|---------------|
| `view_dashboard` | Dashboard utama |
| `manage_users` | Pengguna |
| `manage_roles` | Tenant, peran, permission |
| `manage_master_data` | Lokasi, kandang, vendor |
| `manage_global_catalog` | Strain, grade telur |
| `manage_production` | Input harian (rekap operasional) |
| `manage_inventory` | Inventori |
| `view_cashflow` | Keuangan |

---

## 5. Sitemap — Admin web (repo ini)

### 5.1 Publik & auth

| Path | Status | Catatan |
|------|--------|---------|
| `/` | ✅ | Redirect → `/dashboard` atau `/login` |
| `/login` | ✅ | Username/email + password |

### 5.2 Dashboard `(dashboard)`

| Path | Menu | Status | Model / catatan |
|------|------|--------|-----------------|
| `/dashboard` | Dashboard | 🟡 | KPI dasar ✅; HDP warning ✅; FCR 7 hari + mortalitas + kas minggu (Fase 6b) ✅; portal buyer 🔲 |
| `/dashboard/production` | **Input harian** | 🟡 | Grid status kandang ✅; 4 tab rekap data nyata ✅; kolom HDP % ✅; date toolbar WIB ✅ |
| `/dashboard/inventory` | Inventori | ✅ | Saprodi only (Egg Ledger terpisah — [`egg-ledger-architecture.md`](./egg-ledger-architecture.md)) |
| `/dashboard/inventory/mutations` | Mutasi stok | ✅ | Ledger global `StockMutation` + filter |
| `/dashboard/inventory/[itemId]` | Detail item | ✅ | Stok per lokasi, kartu stok (mutasi), penyesuaian stok |
| `/dashboard/purchase-orders` | Pesanan pembelian | ✅ | PO minimal: buat + terima → `IN_PURCHASE` |
| `/dashboard/purchase-orders/[poId]` | Detail PO | ✅ | Terima barang ke lokasi |
| `/dashboard/finance` | Keuangan | ✅ | Tabs arus kas / penjualan / pelanggan; penjualan potong stok Egg (`OUT_SALES`) — lihat [`egg-sales-stock.md`](./egg-sales-stock.md) |
| `/dashboard/profile` | Profil | ✅ | Password, branding tenant |
| `/dashboard/locations` | Lokasi | ✅ | `Location` |
| `/dashboard/cages` | Kandang | ✅ | `Cage`, QR, siklus on-create |
| `/dashboard/cages/[id]` | Detail kandang | 🟡 | Staff assignment ✅; metrik siklus (populasi, HDP, FCR, mutasi, kesehatan) ✅; riwayat siklus enriched ✅; vaksin/drill-down 🔲 |
| `/dashboard/strains` | Strain | ✅ | `Strain` + `ProductionTarget` (HDP/FCR per umur) |
| `/dashboard/egg-grades` | Grade telur | ✅ | `EggGrade` katalog opsional (label harga); stok jual = TB → Item Egg — [`egg-sales-stock.md`](./egg-sales-stock.md) |
| `/dashboard/vendors` | Vendor | ✅ | `Vendor` |
| `/dashboard/tenants` | Tenant | ✅ | `Tenant` |
| `/dashboard/users` | Pengguna | ✅ | `User` |
| `/dashboard/roles` | Peran & akses | ✅ | `Role`, `Permission` |

#### Rencana admin (🔲)

| Path (usulan) | Model |
|---------------|-------|
| `/dashboard/population` | `PopulationMutation` |
| `/dashboard/health/vaccines` | `VaccineSchedule` ✅ |
| `/dashboard/sales` | `SalesOrder` — P6 |
| `/dashboard/cashflow` | `CashflowTransaction` — P6 (via `/dashboard/finance`) |

### 5.3 API & infrastruktur

| Path | Status | Konsumen |
|------|--------|----------|
| `/api/auth/*` | ✅ | Admin web + mobile (Expo) |
| `/api/storage/*` | ✅ | Upload/logo |
| `/api/upload/logo` | ✅ | Branding tenant |
| `/api/v1/*` | ✅ | **Mobile API v1** — core operasional; lihat tabel di bawah |

#### Mobile API v1 (`app/api/v1/`)

| Method | Path | Permission | Status | Service |
|--------|------|------------|--------|---------|
| `POST` | `/api/v1/mobile/auth/sign-in` | staff-only | ✅ | mobile sign-in |
| `GET` | `/api/v1/cages` | `manage_production` | ✅ | `list-field-cages` |
| `GET` | `/api/v1/cages/[cageId]` | `manage_production` | ✅ | `get-cage-for-production` |
| `POST` | `/api/v1/cages/scan` | `manage_production` | ✅ | `verify-cage-scan` |
| `GET` | `/api/v1/cages/[cageId]/daily-history` | `manage_production` | ✅ | `list-cage-daily-history` |
| `GET` | `/api/v1/egg-grades` | `manage_production` | ✅ | `list-egg-grade-options` (legacy API) |
| `POST` | `/api/v1/production` | `manage_production` | ✅ | `record-daily-production` (TB/TR/TP, multi-record) |
| `PATCH` | `/api/v1/production/[recordId]` | `manage_production` | ✅ | `update-daily-production` (rekonsiliasi stok telur) |
| `POST` | `/api/v1/feed-consumption` | `manage_production` | ✅ | `record-feed-consumption` (potong stok pakan, OUT_FEED) |
| `PATCH` | `/api/v1/feed-consumption/[recordId]` | `manage_production` | ✅ | `update-feed-consumption` (rekonsiliasi delta stok) |
| `POST` | `/api/v1/medical-records` | `manage_production` | ✅ | `record-medical-record` (opsional potong obat/vitamin, OUT_MEDICAL) |
| `PATCH` | `/api/v1/medical-records/[recordId]` | `manage_production` | ✅ | `update-medical-record` (rekonsiliasi delta stok bila tertaut item) |
| `POST` | `/api/v1/population-mutation` | `manage_production` | ✅ | `record-population-mutation` |
| `PATCH` | `/api/v1/population-mutation/[recordId]` | `manage_production` | ✅ | `update-population-mutation` |
| `GET` | `/api/v1/items` | `manage_production` | ✅ | `list-items-for-cage` (Feed/Medicine/Vitamin + stok tersedia) |
| `GET` | `/api/v1/feed-items` | `manage_production` | ✅ | `list-feed-items` (legacy) |

**Format respons:** `{ success, message?, data? }` / `{ success: false, error }` — lihat `lib/api/response.ts`.

**Kontrak OpenAPI:** [`docs/apicontract/openapi.yaml`](./apicontract/openapi.yaml)

**Layanan domain terkait (produksi):**

- `features/production/schemas/daily-production.ts`
- `features/production/schemas/update-daily-production.ts`
- `features/production/services/record-daily-production.ts`
- `features/production/services/update-daily-production.ts`
- `features/production/services/list-daily-production-recap.ts`
- `features/production/services/list-cage-daily-history.ts`
- `features/production/services/list-field-cages.ts`
- `features/production/services/get-cage-for-production.ts`
- `features/production/services/verify-cage-scan.ts`

---

## 6. Sitemap — Mobile (`aapm-mobile`)

> Implementasi UI di [`../aapm-mobile`](../aapm-mobile).  
> **Progress mobile:** [`aapm-mobile/docs/progress.md`](../aapm-mobile/docs/progress.md)

### Alur utama

```
(tabs)/input  →  scan QR / pilih kandang  →  kandang/[id] (hub)
  →  kandang/[id]/input   (form input harian unified)
  →  kandang/[id]/riwayat (riwayat + edit produksi)
```

| Rute | Status | Model / API |
|------|--------|-------------|
| `(auth)/login` | ✅ | `POST /api/v1/mobile/auth/sign-in` |
| `(tabs)/` home | ✅ | `GET /api/v1/cages` |
| `(tabs)/input` | ✅ | QR tile + daftar kandang |
| `scan/qr` | ✅ | `POST /api/v1/cages/scan` → hub |
| `kandang/[id]` hub | ✅ | `GET /api/v1/cages/{id}` |
| `kandang/[id]/input` | ✅ | Form unified 4 section — submit API langsung (produksi, pakan, populasi, pengobatan) |
| `kandang/[id]/riwayat` | ✅ | `GET …/daily-history`; navigasi tanggal WIB; edit semua tipe |
| `kandang/[id]/production/[recordId]` | ✅ | Edit TB/TR/TP |
| `(tabs)/profile` | ✅ | Session + logout |
| Vaksinasi | ✅ | Admin + mobile hub + API |
| Offline sync flush | ✅ | Antrean + flush + warm + picker — [offline-sync-plan.md](../../aapm-mobile/docs/offline-sync-plan.md) |

**Legacy redirect:** `kandang/[id]/produksi`, `kandang/[id]/pakan` → flow baru.

**Deep link / QR:** `aapmmobile://kandang/{qr_code}` — detail di [`docs/ecosystem.md`](./ecosystem.md).

---

## 7. Modul proposal vs progress

| # | Modul | Progress | Admin | Mobile |
|---|--------|----------|-------|--------|
| 1 | User management | ~95% | ✅ | ✅ login |
| 2 | Master data peternakan | ~90% | ✅/🟡 | read-only |
| 3 | Strain & standardisasi | ~75% | 🟡 target HDP/FCR | — |
| 4 | Front office input | ~95% | rekap 4 tab + HDP | ✅ unified form |
| 5 | Offline sync | ~90% | idempotency ✅ | antrean + flush + warm ✅ |
| 6 | Mutasi populasi | ~90% | rekap tab + ledger | ✅ API + ledger |
| 7 | Vendor & procurement | ~85% | vendor ✅ + PO partial/cancel | — |
| 8 | Inventory | ~90% | CRUD + stok + kartu + mutasi global + PO | ✅ picker item |
| 9 | Early warning | ~65% | 🟡 dashboard lite; alert log planned | — |
| 10 | Executive dashboard | ~75% | 🟡 KPI/FCR/mortalitas/kas lite | — |
| 11 | Sales | ~85% | 🟡 sales order + `OUT_SALES` + delivery log | — |
| 12 | Cashflow | ~80% | 🟡 ledger + summary; P&L period planned | — |
| 13 | Health / vaccination | ~85% | rekap pengobatan + vaksin ✅ | pengobatan + vaksin ✅ |

**Vaksinasi ≠ pengobatan:** `VaccineSchedule` (jadwal preventif + reminder) vs `MedicalRecord` (laporan saat flock sakit).

---

## 8. Backlog admin repo

- [x] API v1 produksi (cages, scan, production POST/PATCH, daily-history)
- [x] Auth mobile end-to-end (cookie dari Expo)
- [x] Dashboard Input harian: tab rekap + tabel telur TB/TR/TP
- [x] Tab rekap pakan, populasi, pengobatan (data nyata per tanggal WIB)
- [x] Kolom HDP % di rekap telur
- [x] `ProductionTarget` CRUD (di halaman strain)
- [x] Migrasi `DailyProduction` TB/TR/TP + multi-record
- [x] API feed-consumption + service inventori (potong stok pakan, OUT_FEED)
- [x] API population + medical (medical opsional potong obat/vitamin, OUT_MEDICAL)
- [x] Inventori admin (`Item` CRUD, `InventoryStock` view, kartu stok, penyesuaian stok)
- [x] Telur auto-menambah stok (IN_HARVEST dari TB) + rekonsiliasi saat edit produksi
- [x] PO minimal (`/dashboard/purchase-orders`) + `IN_PURCHASE`
- [x] Populasi ledger (`compute-cycle-population`) + validasi mutasi
- [x] Dashboard KPI dasar (`get-dashboard-stats`)
- [x] Infra tanggal operasional WIB (`lib/business-date.ts`)
- [x] Halaman mutasi stok global (`/dashboard/inventory/mutations`)
- [x] Metrik siklus kandang (`CycleSetting` di detail kandang)
- [x] Modul 13: vaksinasi (jadwal + complete; reminder ringan via status Pending)
- [x] D4 dasar: penjualan + cashflow
- [x] D4 lanjutan: delivery/surat jalan otomatis dari sales
- [x] Alert log in-app untuk early warning persistent
- [ ] D4 lanjutan: harga jual harian formal

## 9. Backlog mobile (Expo)

Lihat [`aapm-mobile/docs/progress.md`](../aapm-mobile/docs/progress.md).

- [x] API client + login staff
- [x] Shell + navigasi (Home, Input, Profil)
- [x] Form input harian unified (accordion) — 4 section submit API
- [x] Produksi TB/TR/TP + submit API
- [x] Konsumsi pakan, mutasi populasi, pengobatan — submit API
- [x] QR scanner kamera
- [x] Riwayat kandang + edit multi-record + navigasi tanggal WIB
- [x] Flush antrean offline (`pending-input-queue`) saat online
- [x] Layar vaksinasi (hub kandang)
- [x] OpenAPI types codegen
- [ ] PATCH offline penuh + badge antrean tab bar

---

## 10. Quick reference — rute admin

```
/                    → redirect
/login

/dashboard                 🟡  (KPI/FCR/mortalitas/kas lite ✅)
/dashboard/production      🟡  (Input harian — rekap + HDP ✅)
/dashboard/inventory       ✅
/dashboard/purchase-orders   ✅
/dashboard/finance         🟡  (sales + cashflow ✅; P&L period planned)
/dashboard/profile         ✅
/dashboard/locations       ✅
/dashboard/cages           ✅
/dashboard/cages/[id]      🟡  (metrik siklus + riwayat enriched ✅)
/dashboard/strains         ✅
/dashboard/egg-grades      ✅
/dashboard/vendors         ✅
/dashboard/tenants         ✅
/dashboard/users           ✅
/dashboard/roles           ✅

/api/auth/*                ✅
/api/v1/*                  ✅  (core operasional)
/api/storage/*             ✅
/api/upload/logo           ✅
```

---

*Perbarui dokumen ini saat menambah halaman admin atau endpoint API. Laporan mingguan: [`docs/weekly progress/`](./weekly%20progress/).*

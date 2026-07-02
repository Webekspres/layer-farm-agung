# Sitemap — Layered Farm Agung (AAPM)

**Living document** untuk melacak **rute admin web**, **API backend**, dan **progress implementasi**.  
Input lapangan (staff kandang) **bukan** di repo ini — lihat **§6**.

| | |
|--|--|
| **Terakhir diperbarui** | 2026-06-24 |
| **Progress proyek** | **~38%** keseluruhan · **~42%** Domain 3 — lihat [`weekly progress/24-06-2026.md`](./weekly%20progress/24-06-2026.md) |
| **Repo ini** | Next.js 16 — **admin dashboard + API provider** |
| **Mobile lapangan** | [`aapm-mobile`](../mobile-apps/aapm-mobile) — React Native + Expo SDK 54 |
| **Ekosistem** | [`docs/ecosystem.md`](./ecosystem.md) |
| **Schema DB** | [`prisma/schema.prisma`](../prisma/schema.prisma) |
| **Nav kode** | [`features/dashboard/config/navigation.ts`](../features/dashboard/config/navigation.ts) |
| **Proteksi rute** | [`proxy.ts`](../proxy.ts) |

---

## 1. Arsitektur produk (pivot 2026-06)

| Aplikasi | Stack | Cakupan |
|----------|-------|---------|
| **AAPM Admin** (repo ini) | Next.js 16, shadcn, Prisma | CRUD master data, user/RBAC, rekap operasional, keuangan |
| **AAPM Mobile** ([`../mobile-apps/aapm-mobile`](../mobile-apps/aapm-mobile)) | React Native + Expo SDK 54 | Input harian kandang: produksi TB/TR/TP, pakan, populasi, pengobatan, QR, offline sync |

**Repo ini tidak lagi memakai Serwist / PWA.** Tidak ada service worker, manifest, atau rute `/kandang` / `/input-harian`.

Backend di repo ini menyediakan:
- **Better Auth** — `app/api/auth/*` (session/cookie; mobile Expo ✅)
- **Server Actions** — mutasi dari dashboard admin
- **Route Handlers** — `app/api/v1/*` operasional untuk mobile (🟡 partial)

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

**Progress domain (perkiraan, 2026-06-24):**

| Domain | Fokus | Progress |
|--------|--------|----------|
| **D1** Identity & tenant | Auth, RBAC, users, tenants | ~95% |
| **D2** Master data | Lokasi, kandang, strain, grade, vendor, target | ~68% |
| **D3** Operasional | Produksi, inventori, sync, kesehatan | ~42% |
| **D4** Finansial | Penjualan, cashflow, dashboard KPI | ~5% |

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
| `/dashboard` | Dashboard | 🟡 | KPI eksekutif (HDP/FCR) 🔲 |
| `/dashboard/production` | **Input harian** | 🟡 | Tab rekap: telur ✅; pakan/populasi/pengobatan placeholder |
| `/dashboard/inventory` | Inventori | ✅ | `Item` CRUD (master + tipe), stok per item |
| `/dashboard/inventory/[itemId]` | Detail item | ✅ | Stok per lokasi, kartu stok (mutasi), penyesuaian stok |
| `/dashboard/finance` | Keuangan | 🟡 | Placeholder "Soon" |
| `/dashboard/profile` | Profil | ✅ | Password, branding tenant |
| `/dashboard/locations` | Lokasi | ✅ | `Location` |
| `/dashboard/cages` | Kandang | ✅ | `Cage`, QR, siklus on-create |
| `/dashboard/cages/[id]` | Detail kandang | 🟡 | Staff assignment ✅; siklus penuh 🔲 |
| `/dashboard/strains` | Strain | ✅ | `Strain` + `ProductionTarget` (HDP/FCR per umur) |
| `/dashboard/egg-grades` | Grade telur | ✅ | `EggGrade` (penjualan; bukan input lapangan) |
| `/dashboard/vendors` | Vendor | ✅ | `Vendor` |
| `/dashboard/tenants` | Tenant | ✅ | `Tenant` |
| `/dashboard/users` | Pengguna | ✅ | `User` |
| `/dashboard/roles` | Peran & akses | ✅ | `Role`, `Permission` |

#### Rencana admin (🔲)

| Path (usulan) | Model |
|---------------|-------|
| `/dashboard/purchase-orders` | `PurchaseOrder` |
| `/dashboard/population` | `PopulationMutation` |
| `/dashboard/health/vaccines` | `VaccineSchedule` |
| `/dashboard/sales` | `SalesOrder` |
| `/dashboard/cashflow` | `CashflowTransaction` |

### 5.3 API & infrastruktur

| Path | Status | Konsumen |
|------|--------|----------|
| `/api/auth/*` | ✅ | Admin web + mobile (Expo) |
| `/api/storage/*` | ✅ | Upload/logo |
| `/api/upload/logo` | ✅ | Branding tenant |
| `/api/v1/*` | 🟡 | **Mobile API v1** — lihat tabel di bawah |

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

> Implementasi UI di [`../mobile-apps/aapm-mobile`](../mobile-apps/aapm-mobile).  
> **Progress mobile:** [`aapm-mobile/docs/progress.md`](../mobile-apps/aapm-mobile/docs/progress.md)

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
| `kandang/[id]/input` | 🟡 | Form unified: produksi ✅; pakan/populasi/pengobatan antrean lokal |
| `kandang/[id]/riwayat` | ✅ | `GET …/daily-history`; edit → `PATCH …/production/{id}` |
| `kandang/[id]/production/[recordId]` | ✅ | Edit TB/TR/TP |
| `(tabs)/profile` | ✅ | Session + logout |
| Vaksinasi | 🔲 | `VaccineSchedule` — Modul 13 |
| Offline sync flush | 🔲 | `SyncQueue` + antrean `AsyncStorage` |

**Legacy redirect:** `kandang/[id]/produksi`, `kandang/[id]/pakan` → flow baru.

**Deep link / QR:** `aapmmobile://kandang/{qr_code}` — detail di [`docs/ecosystem.md`](./ecosystem.md).

---

## 7. Modul proposal vs progress

| # | Modul | Progress | Admin | Mobile |
|---|--------|----------|-------|--------|
| 1 | User management | ~95% | ✅ | ✅ login |
| 2 | Master data peternakan | ~70% | ✅/🟡 | read-only |
| 3 | Strain & standardisasi | ~60% | 🟡 target HDP/FCR | — |
| 4 | Front office input | ~75% | rekap tab | 🟡 unified form |
| 5 | Offline sync | ~15% | schema | antrean lokal |
| 6 | Mutasi populasi | ~20% | 🔲 | UI antrean |
| 7 | Vendor & procurement | ~35% | vendor ✅ | — |
| 8 | Inventory | ~65% | Item CRUD + stok + kartu stok + penyesuaian; potong stok pakan & obat/vitamin; telur auto-IN | picker item nyata + peringatan stok |
| 9 | Early warning | ~0% | 🔲 | 🔲 |
| 10 | Executive dashboard | ~10% | placeholder | — |
| 11 | Sales | ~0% | 🔲 | — |
| 12 | Cashflow | ~0% | 🔲 | — |
| 13 | Health / vaccination | ~12% | 🔲 | pengobatan antrean; vaksin 🔲 |

**Vaksinasi ≠ pengobatan:** `VaccineSchedule` (jadwal preventif + reminder) vs `MedicalRecord` (laporan saat flock sakit).

---

## 8. Backlog admin repo

- [x] API v1 produksi (cages, scan, production POST/PATCH, daily-history)
- [x] Auth mobile end-to-end (cookie dari Expo)
- [x] Dashboard Input harian: tab rekap + tabel telur TB/TR/TP
- [x] `ProductionTarget` CRUD (di halaman strain)
- [x] Migrasi `DailyProduction` TB/TR/TP + multi-record
- [x] API feed-consumption + service inventori (potong stok pakan, OUT_FEED)
- [x] API population + medical (medical opsional potong obat/vitamin, OUT_MEDICAL)
- [x] Inventori admin (`Item` CRUD, `InventoryStock` view, kartu stok, penyesuaian stok)
- [x] Telur auto-menambah stok (IN_HARVEST dari TB) + rekonsiliasi saat edit produksi
- [ ] Tab rekap pakan, populasi, pengobatan (data nyata)
- [ ] Kolom HDP % di rekap telur
- [ ] Siklus kandang penuh (`CycleSetting` di detail kandang)
- [ ] Modul 13: vaksinasi + reminder

## 9. Backlog mobile (Expo)

Lihat [`aapm-mobile/docs/progress.md`](../mobile-apps/aapm-mobile/docs/progress.md).

- [x] API client + login staff
- [x] Shell + navigasi (Home, Input, Profil)
- [x] Form input harian unified (accordion)
- [x] Produksi TB/TR/TP + submit API
- [x] QR scanner kamera
- [x] Riwayat kandang + edit produksi multi-record
- [ ] API feed / populasi / pengobatan + flush antrean
- [ ] Date picker riwayat
- [ ] Layar vaksinasi + reminder
- [ ] OpenAPI types codegen

---

## 10. Quick reference — rute admin

```
/                    → redirect
/login

/dashboard                 🟡
/dashboard/production      🟡  (menu: Input harian)
/dashboard/inventory       🟡
/dashboard/finance         🟡
/dashboard/profile         ✅
/dashboard/locations       ✅
/dashboard/cages           ✅
/dashboard/cages/[id]      🟡
/dashboard/strains         ✅
/dashboard/egg-grades      ✅
/dashboard/vendors         ✅
/dashboard/tenants         ✅
/dashboard/users           ✅
/dashboard/roles           ✅

/api/auth/*                ✅
/api/v1/*                  🟡
/api/storage/*             ✅
/api/upload/logo           ✅
```

---

*Perbarui dokumen ini saat menambah halaman admin atau endpoint API. Laporan mingguan: [`docs/weekly progress/`](./weekly%20progress/).*

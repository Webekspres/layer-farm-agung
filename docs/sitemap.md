# Sitemap — Layered Farm Agung (AAPM)

**Living document** untuk melacak **rute admin web**, **API backend**, dan **progress implementasi**.  
Input lapangan (staff kandang) **bukan** di repo ini — lihat **§2**.

| | |
|--|--|
| **Terakhir diperbarui** | 2026-06-04 |
| **Repo ini** | Next.js 16 — **admin dashboard + API provider** |
| **Mobile lapangan** | **React Native + Expo** (repo terpisah) |
| **Schema DB** | [`prisma/schema.prisma`](../prisma/schema.prisma) |
| **Nav kode** | [`features/dashboard/config/navigation.ts`](../features/dashboard/config/navigation.ts) |
| **Proteksi rute** | [`proxy.ts`](../proxy.ts) |

---

## 1. Arsitektur produk (pivot 2026-06)

| Aplikasi | Stack | Cakupan |
|----------|-------|---------|
| **AAPM Admin** (repo ini) | Next.js 16, shadcn, Prisma | CRUD master data, user/RBAC, rekap operasional, keuangan |
| **AAPM Mobile** (repo terpisah) | React Native + Expo | Input harian kandang: produksi, pakan, mortalitas, QR, offline sync |

**Repo ini tidak lagi memakai Serwist / PWA.** Tidak ada service worker, manifest, atau rute `/kandang` / `/input-harian`.

Backend di repo ini menyediakan:
- **Better Auth** — `app/api/auth/*` (session/cookie; mobile akan pakai pola yang disepakati)
- **Server Actions** — mutasi dari dashboard admin (saat ini)
- **Route Handlers** — `app/api/*` (storage, upload; **API operasional untuk mobile 🔲**)

---

## 2. Referensi bisnis (lokal, tidak di Git)

| Dokumen | Implikasi |
|---------|-----------|
| **Guidance strain Lohmann** | `Strain`, `ProductionTarget`, analytics HDP/FCR |
| **Program vaksinasi** | `VaccineSchedule`, `Item` — UI mobile + rekap admin |
| **Proyek Pengembangan Sistem …** | 13 modul README; mobile = Expo |
| **Rekap Data Farm (sample)** | Validasi form produksi & populasi |

---

## 3. Legenda status

| Status | Arti |
|--------|------|
| ✅ **Done** | Rute/fitur jalan di admin web |
| 🟡 **Partial** | Rute ada; fitur belum lengkap |
| 🔲 **Planned** | Belum diimplementasi |
| 📱 **Mobile** | Dikerjakan di app React Native + Expo |
| 🚫 **N/A** | Bukan halaman UI |

**Progress domain (perkiraan):**

| Domain | Fokus | Progress (admin repo) |
|--------|--------|------------------------|
| **D1** Identity & tenant | Auth, RBAC, users, tenants | ~95% |
| **D2** Master data | Lokasi, kandang, strain, grade, vendor | ~60% |
| **D3** Operasional | Produksi, inventori, sync (backend) | ~15% admin UI; logic/services partial |
| **D4** Finansial | Penjualan, cashflow, dashboard | ~5% |

---

## 4. Peran & akses (admin web)

| Peran | `/dashboard/*` | Catatan |
|-------|----------------|---------|
| **superadmin** | ✅ | Tenant switcher global |
| **admin** | ✅ | Master data + operasional tenant |
| **staff** | 🟡 | Saat ini bisa login dashboard; **penggunaan utama = app mobile** |

| Permission | Cakupan admin |
|------------|---------------|
| `view_dashboard` | Dashboard utama |
| `manage_users` | Pengguna |
| `manage_roles` | Tenant, peran, permission |
| `manage_master_data` | Lokasi, kandang, vendor |
| `manage_global_catalog` | Strain, grade telur |
| `manage_production` | Modul produksi (admin rekap) |
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
| `/dashboard` | Dashboard | 🟡 | KPI eksekutif 🔲 |
| `/dashboard/production` | Produksi | 🟡 | Rekap `DailyProduction` 🔲 |
| `/dashboard/inventory` | Inventori | 🟡 | Placeholder |
| `/dashboard/finance` | Keuangan | 🟡 | Placeholder |
| `/dashboard/profile` | Profil | ✅ | Password, branding tenant |
| `/dashboard/locations` | Lokasi | ✅ | `Location` |
| `/dashboard/cages` | Kandang | ✅ | `Cage`, siklus on-create |
| `/dashboard/cages/[id]` | Detail kandang | 🟡 | Siklus penuh 🔲 |
| `/dashboard/strains` | Strain | ✅ | `Strain` |
| `/dashboard/egg-grades` | Grade telur | ✅ | `EggGrade` |
| `/dashboard/vendors` | Vendor | ✅ | `Vendor` |
| `/dashboard/tenants` | Tenant | ✅ | `Tenant` |
| `/dashboard/users` | Pengguna | ✅ | `User` |
| `/dashboard/roles` | Peran & akses | ✅ | `Role`, `Permission` |

#### Rencana admin (🔲)

| Path (usulan) | Model |
|---------------|-------|
| `/dashboard/production-targets` | `ProductionTarget` |
| `/dashboard/items` | `Item` |
| `/dashboard/inventory/stocks` | `InventoryStock` |
| `/dashboard/purchase-orders` | `PurchaseOrder` |
| `/dashboard/population` | `PopulationMutation` |
| `/dashboard/health/vaccines` | `VaccineSchedule` |
| `/dashboard/sales` | `SalesOrder` |
| `/dashboard/cashflow` | `CashflowTransaction` |

### 5.3 API & infrastruktur

| Path | Status | Konsumen |
|------|--------|----------|
| `/api/auth/*` | ✅ | Admin web, **mobile (Expo) 🔲** |
| `/api/storage/*` | ✅ | Upload/logo |
| `/api/upload/logo` | ✅ | Branding tenant |
| `/api/mobile/*` atau `/api/v1/*` | 🔲 | **Produksi, pakan, sync — untuk Expo** |

**Layanan domain yang sudah ada (siap diexpose ke API):**

- `features/production/schemas/daily-production.ts`
- `features/production/services/record-daily-production.ts`
- `features/production/services/list-field-cages.ts` — list kandang + status input hari ini
- `features/production/services/get-cage-for-production.ts` — detail kandang untuk form produksi

---

## 6. Sitemap — Mobile (React Native + Expo, repo terpisah)

> Tidak ada rute di Next.js. Dokumentasi target untuk tim mobile.

| Layar (usulan) | Modul | Model / API |
|----------------|-------|-------------|
| Home / daftar kandang | Front office | `Cage`, progress harian |
| Scan QR kandang | Input harian | Deep link → form produksi |
| Form produksi telur | Produksi | `DailyProduction` |
| Input pakan | Inventori | `FeedConsumption` |
| Mortalitas | Populasi | `PopulationMutation` |
| Vaksinasi | Kesehatan | `VaccineSchedule` |
| Profil & sync | Offline | `SyncQueue`, antrean lokal |

**QR deep link (mobile):** `aapm://kandang/[cage_id]/produksi` atau universal link — disepakati di repo Expo.

---

## 7. Modul README vs progress

| # | Modul | Admin (repo ini) | Mobile (Expo) |
|---|--------|------------------|---------------|
| 1 | User management | ✅ | 🔲 auth API |
| 2 | Master data | 🟡 | konsumsi read-only |
| 3 | Strain & standardisasi | 🟡 | — |
| 4 | Front office input | — | 📱 |
| 5 | Offline sync | backend `SyncQueue` | 📱 |
| 6 | Mutasi populasi | 🔲 | 📱 |
| 7 | Vendor & procurement | 🟡 | — |
| 8 | Inventory | 🔲 | 📱 konsumsi pakan |
| 9 | Early warning | 🔲 | 📱 notifikasi |
| 10 | Executive dashboard | 🔲 | — |
| 11 | Sales | 🔲 | — |
| 12 | Cashflow | 🔲 | — |
| 13 | Health / vaccination | 🔲 | 📱 |

---

## 8. Backlog admin repo

- [ ] API v1 untuk mobile (produksi, list kandang, auth)
- [ ] Dashboard produksi: tabel rekap harian
- [ ] `ProductionTarget` CRUD
- [ ] Siklus kandang penuh (`CycleSetting`)
- [ ] Inventori admin (`Item`, `InventoryStock`)

## 9. Backlog mobile (Expo — luar repo)

- [ ] Shell + navigasi (Dashboard, Input, Profil)
- [ ] QR scanner
- [ ] Form produksi + offline queue
- [ ] Sinkronisasi ke `SyncQueue` / API

---

## 10. Quick reference — rute admin saat ini

```
/                    → redirect
/login

/dashboard           🟡
/dashboard/production      🟡
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
/api/storage/*             ✅
/api/upload/logo           ✅
```

---

*Perbarui dokumen ini saat menambah halaman admin atau endpoint API untuk mobile.*

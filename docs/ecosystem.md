# Ekosistem AAPM — dua repositori

**Layered Farm Agung (AAPM)** dikembangkan sebagai **dua aplikasi terpisah** yang saling terhubung lewat API. Bukan monorepo tunggal; kontrak antar-repo dijaga lewat **OpenAPI** dan dokumentasi ini.

| | |
|--|--|
| **Terakhir diperbarui** | 2026-09-01 |
| **Pivot** | Mobile **PWA/Serwist di Next.js dihentikan** → **React Native + Expo** |

---

## 1. Ringkasan peran

| Repositori | Path lokal (relatif workspace) | Peran |
|------------|-------------------------------|--------|
| **layer-farm-agung** | `./` (repo ini) | **Admin dashboard** (desktop/web), **API backend**, database (Prisma/PostgreSQL), auth (Better Auth), MinIO |
| **layer-farm-agung-mobile** | `../layer-farm-agung-mobile` | **Aplikasi lapangan** untuk **staff kandang** — input harian, QR, offline sync ✅ |

```mermaid
flowchart LR
  subgraph admin ["layer-farm-agung"]
    UI["(dashboard) Admin UI"]
    API["/api/auth + /api/v1"]
    DB[(PostgreSQL)]
    UI --> API
    API --> DB
  end

  subgraph mobile ["layer-farm-agung-mobile"]
    APP["Expo App"]
    LOCAL["Offline outbox"]
    APP --> LOCAL
  end

  APP -->|"HTTPS + session cookie"| API
```

---

## 2. Pembagian tanggung jawab

### Backend (`layer-farm-agung`) — **sumber kebenaran data**

| Area | Lokasi kode | Konsumen |
|------|-------------|----------|
| Master data (lokasi, kandang, strain, grade, vendor) | `features/*` + dashboard CRUD | Admin web |
| RBAC & tenant | `features/auth`, `features/permissions` | Admin + API |
| Operasional (produksi, pakan, populasi) | `features/production`, … + `app/api/v1/` | **Mobile** (+ rekap admin) |
| Skema & migrasi DB | `prisma/schema.prisma` | Hanya repo ini |
| Kontrak API mobile | `docs/apicontract/openapi.yaml` | Tim mobile |

**Jangan** menambah UI lapangan (`/kandang`, input harian) di Next.js. **Jangan** menduplikasi aturan bisnis di mobile — validasi utama tetap di server.

### Mobile (`layer-farm-agung-mobile`) — **klien operasional**

| Area | Tanggung jawab |
|------|----------------|
| Login staff | Panggil Better Auth di backend |
| Daftar kandang, form produksi, scan QR | UI + state lokal |
| Offline / antrean sync | Klien (flush ke `/api/v1/*` saat online) ✅ |
| Brand & touch UX lapangan | Ikuti token dari `layer-farm-agung/DESIGN.md` (adaptasi RN) |

Peran **staff** (`staff.kandang`) ditujukan untuk mobile; admin/superadmin memakai dashboard web.

---

## 3. Alur integrasi API

1. Mobile memanggil `POST /api/v1/mobile/auth/sign-in` (atau Better Auth) pada backend.
2. Session cookie disimpan dan dikirim pada setiap `GET|POST|PATCH|DELETE /api/v1/*`.
3. Respons memakai envelope: `{ success, message, data }` atau `{ success: false, error }`.

Detail endpoint: **[apicontract/openapi.yaml](./apicontract/openapi.yaml)** (25 route `/api/v1/*`).

| Endpoint v1 (ringkas) | Status |
|-----------------------|--------|
| Auth mobile, field overview, input-window | ✅ |
| Cages, scan, daily-history, daily-report, daily-corrections | ✅ |
| Production, feed, population, medical (POST + PATCH) | ✅ |
| Vaccine schedules, vaccinations | ✅ |
| Items, egg-grades, feed-items (legacy) | ✅ |
| Notifications, push-tokens | ✅ |

---

## 4. Pengembangan lokal (kedua repo)

### Urutan disarankan

```bash
# Terminal 1 — backend
cd layer-farm-agung
bun run docker:db    # Postgres host :5433
bun run dev          # http://localhost:3000

# Terminal 2 — mobile
cd layer-farm-agung-mobile
bun install
bunx expo start
```

### URL API dari perangkat fisik

`localhost` di HP **tidak** mengarah ke laptop. Set `EXPO_PUBLIC_API_URL` di mobile ke IP LAN mesin dev, mis.:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Backend: pastikan `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` konsisten dengan URL yang diakses mobile. CORS: `MOBILE_CORS_ORIGINS` di `.env` backend (lihat `.env.example`).

### Akun uji (seed)

| User | Password | Peran |
|------|----------|--------|
| `staff.kandang` | `password123` | Staff lapangan (mobile) |
| `admin.cabang` | `password123` | Admin tenant |
| `superadmin` | `password123` | Global |

---

## 5. Deep link & QR

- Skema Expo: `aapmmobile://` (`app.json` → `scheme`).
- QR kandang: scan → `POST /api/v1/cages/scan` → hub `kandang/[id]`.
- Data kandang: `GET /api/v1/cages/{cageId}`.

---

## 6. Aturan perubahan lintas repo

| Perubahan di backend | Tindakan di mobile |
|----------------------|-------------------|
| Endpoint baru / field baru | Update `openapi.yaml` + regenerate types / client |
| Validasi bisnis baru | Sesuaikan form UI; jangan skip error `400` dari API |
| Migrasi Prisma | Tidak ada migrasi di mobile — hanya adaptasi tipe respons |

| Perubahan di mobile | Tindakan di backend |
|---------------------|---------------------|
| Kebutuhan data baru | Tambah service + route `app/api/v1/` + OpenAPI |
| Flow offline baru | Backend tetap idempotent / terima `clientMutationId` |

**PR rule:** perubahan API → update `docs/apicontract/openapi.yaml` dan baris terkait di `docs/sitemap.md` dalam PR yang sama.

---

## 7. Dokumen terkait

| Repo | Dokumen |
|------|---------|
| **layer-farm-agung** | [AGENTS.md](../AGENTS.md), [sitemap.md](./sitemap.md), [apicontract/](./apicontract/), [DEV_NOTES.md](../DEV_NOTES.md), [DESIGN.md](../DESIGN.md) |
| **layer-farm-agung-mobile** | [docs/](../../layer-farm-agung-mobile/docs/) (progress & roadmap), [AGENTS.md](../../layer-farm-agung-mobile/AGENTS.md) |
